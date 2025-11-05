import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Tabs } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { selectPlantingSiteWithdrawnSpecies } from 'src/redux/features/nurseryWithdrawals/nurseryWithdrawalsSelectors';
import {
  SpeciesPlot,
  requestPlantingSiteWithdrawnSpecies,
} from 'src/redux/features/nurseryWithdrawals/nurseryWithdrawalsThunks';
import { selectPlantingSiteT0, selectPlotsWithObservations } from 'src/redux/features/tracking/trackingSelectors';
import {
  PlotsWithObservationsSearchResult,
  requestPermanentPlotsWithObservations,
  requestPlantingSiteT0,
} from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { SiteT0Data } from 'src/types/Tracking';
import useStickyTabs from 'src/utils/useStickyTabs';

import PermanentPlotsTab from './PermanentPlotsTab';
import SurvivalRateInstructions from './SurvivalRateInstructions';
import TemporaryPlotsTab from './TemporaryPlotsTab';

const SurvivalRateSettings = () => {
  const { plantingSite, setSelectedPlantingSite } = usePlantingSiteData();
  const [requestId, setRequestId] = useState('');
  const plantingSiteT0Response = useAppSelector(selectPlantingSiteT0(requestId));
  const [plotsRequestId, setPlotsRequestId] = useState('');
  const plotsWithObservationsResponse = useAppSelector(selectPlotsWithObservations(plotsRequestId));
  const [plotsWithObservations, setPlotsWithObservations] = useState<PlotsWithObservationsSearchResult[]>();
  const [speciesRequestId, setSpeciesRequestId] = useState('');
  const withdrawnSpeciesResponse = useAppSelector(selectPlantingSiteWithdrawnSpecies(speciesRequestId));
  const [withdrawnSpeciesPlots, setWithdrawnSpeciesPlots] = useState<SpeciesPlot[]>();
  const dispatch = useAppDispatch();
  const [t0SiteData, setT0SiteData] = useState<SiteT0Data>();
  const navigate = useSyncNavigate();
  const { activeLocale } = useLocalization();
  const params = useParams<{
    plantingSiteId: string;
  }>();
  const theme = useTheme();

  const plantingSiteId = Number(params.plantingSiteId);

  const permanentPlots = useMemo(() => {
    return plotsWithObservations?.filter((p) => !!p.permanentIndex);
  }, [plotsWithObservations]);

  const temporaryPlots = useMemo(() => {
    return plotsWithObservations?.filter((p) => !p.permanentIndex);
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

  const zonesWithObservations = useMemo(() => {
    if (!temporaryPlots) {
      return {};
    }
    return temporaryPlots.reduce(
      (acc, plot) => {
        const zoneId = plot.plantingSubzone_plantingZone_id;
        if (!zoneId) {
          return acc;
        }
        if (!acc[zoneId]) {
          acc[zoneId] = [];
        }
        acc[zoneId].push(plot);
        return acc;
      },
      {} as Record<string, PlotsWithObservationsSearchResult[]>
    );
  }, [temporaryPlots]);

  const numberOfSetZones = useMemo(() => {
    let totalSet = 0;
    Object.entries(zonesWithObservations).forEach(([zoneId, plots]) => {
      const correspondingZone = t0SiteData?.zones?.find((z) => z.plantingZoneId.toString() === zoneId.toString());

      const plotIds = plots.map((plot) => plot.id.toString());
      const withdrawnSpeciesOfZone = withdrawnSpeciesPlots?.filter((wsp) =>
        plotIds.includes(wsp.monitoringPlotId.toString())
      );

      const speciesMap = new Map<number, { density: number; speciesId: number }>();
      withdrawnSpeciesOfZone?.forEach((plot) => {
        plot.species.forEach((wdSpecies) => {
          if (!speciesMap.has(wdSpecies.speciesId)) {
            speciesMap.set(wdSpecies.speciesId, wdSpecies);
          }
        });
      });
      const allWithdrawnSpeciesForZone = Array.from(speciesMap.values());

      const everySpeciesSet = allWithdrawnSpeciesForZone.every((sp) => {
        const correspondingSpecies = correspondingZone?.densityData.find((dd) => dd.speciesId === sp.speciesId);
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
  }, [t0SiteData, withdrawnSpeciesPlots, zonesWithObservations]);

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    return (temporaryPlots?.length || 0) > 0
      ? [
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
          {
            id: 'temporary',
            label: strings.TEMPORARY_PLOTS,
            children: (
              <TemporaryPlotsTab
                t0SiteData={t0SiteData}
                zonesWithObservations={zonesWithObservations}
                withdrawnSpeciesPlots={withdrawnSpeciesPlots}
                including={t0SiteData?.survivalRateIncludesTempPlots}
              />
            ),
          },
        ]
      : [
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
  }, [
    activeLocale,
    permanentPlots,
    plantingSiteId,
    t0SiteData,
    temporaryPlots,
    withdrawnSpeciesPlots,
    zonesWithObservations,
  ]);

  useEffect(() => {
    setSelectedPlantingSite(plantingSiteId);
  }, [plantingSiteId, setSelectedPlantingSite]);

  useEffect(() => {
    if (plantingSite && plantingSite.id !== -1) {
      const request = dispatch(requestPlantingSiteT0(plantingSite.id));
      setRequestId(request.requestId);
      const requestPlots = dispatch(requestPermanentPlotsWithObservations(plantingSite.id));
      setPlotsRequestId(requestPlots.requestId);
      const requestSpeciesPlots = dispatch(requestPlantingSiteWithdrawnSpecies(plantingSite.id));
      setSpeciesRequestId(requestSpeciesPlots.requestId);
    }
  }, [dispatch, plantingSite]);

  useEffect(() => {
    if (plantingSiteT0Response?.status === 'success') {
      setT0SiteData(plantingSiteT0Response.data);
    }
  }, [plantingSiteT0Response]);

  useEffect(() => {
    if (plotsWithObservationsResponse?.status === 'success') {
      setPlotsWithObservations(plotsWithObservationsResponse.data);
    }
  }, [plotsWithObservationsResponse]);

  useEffect(() => {
    if (withdrawnSpeciesResponse?.status === 'success') {
      setWithdrawnSpeciesPlots(withdrawnSpeciesResponse.data);
    }
  }, [withdrawnSpeciesResponse]);

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
    <Page crumbs={crumbs} title={strings.formatString(strings.SURVIVAL_RATE_SETTINGS_FOR, plantingSite?.name || '')}>
      <Card radius='8px'>
        <SurvivalRateInstructions />
        <Box width={'100%'} display='flex' justifyContent={'space-between'} alignItems={'center'}>
          <Box paddingY={3} display={'flex'} alignItems={'center'}>
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
                <Box
                  height={'32px'}
                  width={'1px'}
                  sx={{ backgroundColor: theme.palette.TwClrBrdrTertiary }}
                  marginX={1}
                />
                {(t0SiteData?.zones.length || 0) === numberOfSetZones ? (
                  <Typography fontWeight={500} color={theme.palette.TwClrTxtSuccess}>
                    {strings.T0_SET_FOR_TEMPORARY_PLOTS}
                  </Typography>
                ) : numberOfSetZones === 0 ? (
                  <Typography fontWeight={500} color={theme.palette.TwClrTxtWarning}>
                    {strings.T0_NOT_SET_FOR_TEMPORARY_PLOTS}
                  </Typography>
                ) : (
                  <Typography fontWeight={500} color={theme.palette.TwClrTxtWarning}>
                    {strings.formatString(
                      strings.NUMBER_OF_PLOTS_SET_FOR_TEMPORARY_PLOTS,
                      numberOfSetZones,
                      Object.entries(zonesWithObservations).length || 0
                    )}
                  </Typography>
                )}
              </>
            )}
          </Box>
          <Box>
            <Button
              icon='iconEdit'
              label={activeTab === 'permanent' ? strings.EDIT_PERMANENT_PLOTS : strings.EDIT_TEMPORARY_PLOTS}
              onClick={goToEditSurvivalRateSettings}
              disabled={!plotsWithObservations || plotsWithObservations.length === 0}
              priority='secondary'
              size='medium'
            />
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
