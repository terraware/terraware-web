import React, { useCallback, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Tabs } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization, useUser } from 'src/providers';
import { useGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import { useGetT0SiteDataQuery, useGetT0SpeciesForPlantingSiteQuery } from 'src/queries/generated/t0';
import { useGetPlotsWithObservationsQuery } from 'src/queries/search/t0';
import { PlotsWithObservationsSearchResult } from 'src/redux/features/tracking/trackingThunks';
import strings from 'src/strings';
import useStickyTabs from 'src/utils/useStickyTabs';

import PermanentPlotsTab from './PermanentPlotsTab';
import SurvivalRateInstructions from './SurvivalRateInstructions';
import TemporaryPlotsTab from './TemporaryPlotsTab';

const SurvivalRateSettings = () => {
  const navigate = useSyncNavigate();
  const { activeLocale } = useLocalization();
  const { isAllowed } = useUser();
  const { isMobile } = useDeviceInfo();
  const params = useParams<{ plantingSiteId: string }>();
  const theme = useTheme();
  const { selectedOrganization } = useOrganization();
  const plantingSiteId = Number(params.plantingSiteId);
  const skipPlantingSite = useMemo(
    () => plantingSiteId === undefined || isNaN(plantingSiteId) || plantingSiteId === -1,
    [plantingSiteId]
  );
  const { data: plantingSite } = useGetPlantingSiteQuery(plantingSiteId, { skip: skipPlantingSite });
  const { data: t0SiteDataResponse } = useGetT0SiteDataQuery(plantingSiteId, { skip: skipPlantingSite });
  const t0SiteData = useMemo(() => t0SiteDataResponse?.data, [t0SiteDataResponse]);
  const { data: t0Species } = useGetT0SpeciesForPlantingSiteQuery(plantingSiteId, { skip: skipPlantingSite });
  const withdrawnSpeciesPlots = useMemo(() => t0Species?.plots, [t0Species]);
  const { data: plotsWithObservations } = useGetPlotsWithObservationsQuery(plantingSiteId, {
    skip: skipPlantingSite,
  });

  const userCanEdit = isAllowed('EDIT_SURVIVAL_RATE_SETTINGS', { organization: selectedOrganization });

  const permanentPlots = useMemo(() => {
    return plotsWithObservations?.filter(
      (p) => !!p.permanentIndex && p.observationPlots.some((op) => op.isPermanent === 'true')
    );
  }, [plotsWithObservations]);

  const temporaryPlots = useMemo(() => {
    return plotsWithObservations?.filter(
      (p) => !p.permanentIndex && p.observationPlots.some((op) => op.isPermanent === 'false')
    );
  }, [plotsWithObservations]);

  const numberOfSetPermanentPlots = useMemo(() => {
    let totalSet = 0;
    permanentPlots?.forEach((pp) => {
      const correspondingPlot = t0SiteData?.plots?.find(
        (plot) => plot.monitoringPlotId.toString() === pp.id.toString()
      );
      if (correspondingPlot?.observationId) {
        totalSet = totalSet + 1;
      } else {
        const correspondingWithdrawnSpeciesPlot = withdrawnSpeciesPlots?.find(
          (plot) => plot.monitoringPlotId.toString() === pp.id.toString()
        );
        const everySpeciesSet = correspondingWithdrawnSpeciesPlot?.species.every((withdrawnSp) => {
          return correspondingPlot?.densityData.find(
            (dd) => dd.speciesId.toString() === withdrawnSp.speciesId.toString()
          );
        });
        if (everySpeciesSet) {
          totalSet = totalSet + 1;
        }
      }
    });
    return totalSet;
  }, [permanentPlots, t0SiteData, withdrawnSpeciesPlots]);

  const strataWithObservations = useMemo(() => {
    if (!temporaryPlots) {
      return {};
    }
    return temporaryPlots.reduce(
      (acc, plot) => {
        const stratumId = plot.substratum_stratum_id;
        if (!stratumId) {
          return acc;
        }
        if (!acc[stratumId]) {
          acc[stratumId] = [];
        }
        acc[stratumId].push(plot);
        return acc;
      },
      {} as Record<string, PlotsWithObservationsSearchResult[]>
    );
  }, [temporaryPlots]);

  const numberOfSetStrata = useMemo(() => {
    let totalSet = 0;
    Object.entries(strataWithObservations).forEach(([stratumId, plots]) => {
      const correspondingStratum = t0SiteData?.strata?.find((z) => z.stratumId.toString() === stratumId.toString());

      const plotIds = plots.map((plot) => plot.id.toString());
      const withdrawnSpeciesOfStratum = withdrawnSpeciesPlots?.filter((wsp) =>
        plotIds.includes(wsp.monitoringPlotId.toString())
      );

      const speciesMap = new Map<number, { density?: number; speciesId: number }>();
      withdrawnSpeciesOfStratum?.forEach((plot) => {
        plot.species.forEach((wdSpecies) => {
          if (!speciesMap.has(wdSpecies.speciesId)) {
            speciesMap.set(wdSpecies.speciesId, wdSpecies);
          }
        });
      });
      const allWithdrawnSpeciesForStratum = Array.from(speciesMap.values());

      const everySpeciesSet = allWithdrawnSpeciesForStratum.every((sp) => {
        const correspondingSpecies = correspondingStratum?.densityData.find((dd) => dd.speciesId === sp.speciesId);
        if (correspondingSpecies) {
          return true;
        } else {
          return false;
        }
      });

      if (everySpeciesSet) {
        totalSet = totalSet + 1;
      }
    });
    return totalSet;
  }, [t0SiteData, withdrawnSpeciesPlots, strataWithObservations]);

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    const _tabs = [
      {
        id: 'permanent',
        label: strings.PERMANENT_PLOTS,
        children: (
          <PermanentPlotsTab
            plantingSiteId={plantingSiteId}
            plotsWithObservations={permanentPlots}
            t0Plots={t0SiteData?.plots}
            withdrawnSpeciesPlots={withdrawnSpeciesPlots}
          />
        ),
      },
    ];

    if ((temporaryPlots?.length || 0) > 0) {
      _tabs.push({
        id: 'temporary',
        label: strings.TEMPORARY_PLOTS,
        children: (
          <TemporaryPlotsTab
            t0SiteData={t0SiteData}
            strataWithObservations={strataWithObservations}
            withdrawnSpeciesPlots={withdrawnSpeciesPlots}
            including={t0SiteData?.survivalRateIncludesTempPlots}
          />
        ),
      });
    }

    return _tabs;
  }, [
    activeLocale,
    permanentPlots,
    plantingSiteId,
    t0SiteData,
    temporaryPlots,
    withdrawnSpeciesPlots,
    strataWithObservations,
  ]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'permanent',
    tabs,
    viewIdentifier: 'survival-rate-settings',
  });

  const goToEditSurvivalRateSettings = useCallback(() => {
    navigate({
      pathname: APP_PATHS.EDIT_SURVIVAL_RATE_SETTINGS.replace(':plantingSiteId', plantingSiteId.toString()),
      search: `tab=${activeTab}`,
    });
  }, [activeTab, navigate, plantingSiteId]);

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.OBSERVATIONS : '',
        to: APP_PATHS.OBSERVATIONS,
      },
    ],
    [activeLocale]
  );

  return (
    <Page
      crumbs={crumbs}
      title={strings.formatString(strings.SURVIVAL_RATE_SETTINGS_FOR, plantingSite?.site?.name || '')}
    >
      <Card radius='8px' flushMobile>
        <SurvivalRateInstructions />
        <Box width={'100%'} display='flex' justifyContent={'space-between'} alignItems={'center'}>
          <Box
            paddingY={3}
            display={'flex'}
            alignItems={isMobile ? 'start' : 'center'}
            flexDirection={isMobile ? 'column' : 'row'}
          >
            {(permanentPlots?.length || 0) > 0 && (permanentPlots?.length || 0) === numberOfSetPermanentPlots ? (
              <Typography fontWeight={500} color={theme.palette.TwClrTxtSuccess}>
                {strings.T0_SET_FOR_PERMANENT_PLOTS}
              </Typography>
            ) : numberOfSetPermanentPlots === 0 ? (
              <Typography fontWeight={500} color={theme.palette.TwClrTxtWarning}>
                {strings.T0_NOT_SET_FOR_PERMANENT_PLOTS}
              </Typography>
            ) : (
              <Typography fontWeight={500} color={theme.palette.TwClrTxtWarning}>
                {strings.formatString(
                  strings.NUMBER_OF_PLOTS_SET_FOR_PERMANENT_PLOTS,
                  numberOfSetPermanentPlots,
                  permanentPlots?.length || 0
                )}
              </Typography>
            )}

            {(temporaryPlots?.length || 0) > 0 && t0SiteData?.survivalRateIncludesTempPlots && (
              <>
                {!isMobile && (
                  <Box
                    height={'32px'}
                    width={'1px'}
                    sx={{ backgroundColor: theme.palette.TwClrBrdrTertiary }}
                    marginX={1}
                  />
                )}
                {(Object.entries(strataWithObservations).length || 0) === numberOfSetStrata ? (
                  <Typography fontWeight={500} color={theme.palette.TwClrTxtSuccess}>
                    {strings.T0_SET_FOR_TEMPORARY_PLOTS}
                  </Typography>
                ) : numberOfSetStrata === 0 ? (
                  <Typography fontWeight={500} color={theme.palette.TwClrTxtWarning}>
                    {strings.T0_NOT_SET_FOR_TEMPORARY_PLOTS}
                  </Typography>
                ) : (
                  <Typography fontWeight={500} color={theme.palette.TwClrTxtWarning}>
                    {strings.formatString(
                      strings.NUMBER_OF_PLOTS_SET_FOR_TEMPORARY_PLOTS,
                      numberOfSetStrata,
                      Object.entries(strataWithObservations).length || 0
                    )}
                  </Typography>
                )}
              </>
            )}
          </Box>
          <Box>
            {userCanEdit && (
              <Button
                icon='iconEdit'
                label={
                  isMobile
                    ? undefined
                    : activeTab === 'permanent'
                      ? strings.EDIT_PERMANENT_PLOTS
                      : strings.EDIT_TEMPORARY_PLOTS
                }
                onClick={goToEditSurvivalRateSettings}
                disabled={!plotsWithObservations || plotsWithObservations.length === 0}
                priority='secondary'
                size='medium'
              />
            )}
          </Box>
        </Box>

        <Tabs
          activeTab={activeTab}
          onChangeTab={onChangeTab}
          tabs={tabs}
          headerBorder={true}
          sx={{
            '& .tab-header': {
              margin: 0,
            },
          }}
        />
      </Card>
    </Page>
  );
};

export default SurvivalRateSettings;
