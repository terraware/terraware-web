import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Icon, IconTooltip, Tabs, Textfield, Tooltip } from '@terraware/web-components';
import getDateDisplayValue from '@terraware/web-components/utils/date';

import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { getConditionString } from 'src/redux/features/observations/utils';
import DetailsPage from 'src/scenes/ObservationsRouter/common/DetailsPage';
import MonitoringPlotPhotos from 'src/scenes/ObservationsRouter/common/MonitoringPlotPhotos';
import SpeciesTotalPlantsChart from 'src/scenes/ObservationsRouter/common/SpeciesTotalPlantsChart';
import strings from 'src/strings';
import {
  ObservationMonitoringPlotResultsPayload,
  ObservationSpeciesResults,
  ObservationStratumResultsPayload,
  ObservationSubstratumResultsPayload,
} from 'src/types/Observations';
import { getShortTime } from 'src/utils/dateFormatter';
import { getObservationSpeciesLivePlantsCount } from 'src/utils/observation';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useStickyTabs from 'src/utils/useStickyTabs';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import SpeciesSurvivalRateChart from '../common/SpeciesSurvivalRateChart';
import ObservationDataTab from './ObservationDataTab';
import PhotosAndVideosTab from './PhotosAndVideosTab';

export default function ObservationMonitoringPlotDetails(): JSX.Element | undefined {
  const params = useParams<{
    plantingSiteId: string;
    observationId: string;
    stratumName: string;
    monitoringPlotId: string;
  }>();

  const plantingSiteId = Number(params.plantingSiteId);
  const observationId = Number(params.observationId);
  const stratumName = params.stratumName;
  const monitoringPlotId = Number(params.monitoringPlotId);

  const defaultTimeZone = useDefaultTimeZone();
  const navigate = useSyncNavigate();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();

  const { species } = useSpeciesData();
  const { plantingSite, adHocObservationResults, observationResults } = usePlantingSiteData();
  const [stratumResult, setStratumResult] = useState<ObservationStratumResultsPayload>();
  const [substratumResult, setSubstratumResult] = useState<ObservationSubstratumResultsPayload>();
  const [monitoringPlotResult, setMonitoringPlotResult] = useState<ObservationMonitoringPlotResultsPayload>();
  const isEditObservationsEnabled = isEnabled('Edit Observations');

  const result = useMemo(() => {
    if (!Number.isNaN(observationId)) {
      return (
        observationResults?.find((_result) => _result.observationId === observationId) ??
        adHocObservationResults?.find((_result) => _result.observationId === observationId)
      );
    }
  }, [observationResults, adHocObservationResults, observationId]);

  const navigateToStratumDetails = useCallback(() => {
    if (stratumName) {
      navigate(
        APP_PATHS.OBSERVATION_STRATUM_DETAILS.replace(':plantingSiteId', plantingSiteId.toString())
          .replace(':observationId', Number(observationId).toString())
          .replace(':stratumName', encodeURIComponent(stratumName))
      );
    }
  }, [navigate, observationId, stratumName, plantingSiteId]);

  useEffect(() => {
    let plotFound = false;
    if (result) {
      result.strata.forEach((_stratum) =>
        _stratum.substrata.forEach((_substratum) =>
          _substratum.monitoringPlots.forEach((plot) => {
            if (plot.monitoringPlotId === monitoringPlotId) {
              setStratumResult(_stratum);
              setSubstratumResult(_substratum);
              setMonitoringPlotResult(plot);
              plotFound = true;
              return;
            }
          })
        )
      );
      if (!plotFound) {
        navigateToStratumDetails();
      }
    }
  }, [result, monitoringPlotId, navigateToStratumDetails]);

  const stratum = useMemo(() => {
    if (stratumResult) {
      return plantingSite?.strata?.find((_stratum) => _stratum.id === stratumResult.stratumId);
    }
  }, [plantingSite, stratumResult]);

  const substratum = useMemo(() => {
    if (substratumResult) {
      return stratum?.substrata?.find((_substratum) => _substratum.id === substratumResult.substratumId);
    }
  }, [stratum, substratumResult]);

  const monitoringPlotSpecies = useMemo((): ObservationSpeciesResults[] => {
    if (monitoringPlotResult) {
      return monitoringPlotResult.species.map((_species) => {
        if (_species.speciesId !== undefined) {
          const foundSpecies = species.find((candidate) => candidate.id === _species.speciesId);
          return {
            ..._species,
            speciesCommonName: foundSpecies?.commonName ?? '',
            speciesScientificName: foundSpecies?.scientificName ?? '',
          };
        } else {
          return {
            ..._species,
            speciesScientificName: _species.speciesName ?? '',
          };
        }
      });
    } else {
      return [];
    }
  }, [monitoringPlotResult, species]);

  const gridSize = isMobile ? 12 : 4;

  const data: Record<string, any>[] = useMemo(() => {
    const handleMissingData = (num?: number) => (!result?.completedTime && !num ? '' : num);

    const swCoordinatesLat = monitoringPlotResult?.boundary?.coordinates?.[0]?.[0]?.[0];
    const swCoordinatesLong = monitoringPlotResult?.boundary?.coordinates?.[0]?.[0]?.[1];

    return [
      {
        label: strings.DATE,
        value: monitoringPlotResult?.completedTime
          ? getDateDisplayValue(monitoringPlotResult.completedTime, plantingSite?.timeZone)
          : undefined,
      },
      {
        label: strings.TIME,
        value: monitoringPlotResult?.completedTime
          ? getShortTime(
              monitoringPlotResult?.completedTime,
              activeLocale,
              plantingSite?.timeZone || defaultTimeZone.get().id
            )
          : undefined,
      },
      { label: strings.OBSERVER, value: monitoringPlotResult?.claimedByName },
      { label: strings.STRATUM, value: stratum?.name },
      { label: strings.SUBSTRATUM, value: substratum?.name },
      {
        label: strings.MONITORING_PLOT_TYPE,
        value: monitoringPlotResult
          ? monitoringPlotResult.isPermanent
            ? strings.PERMANENT
            : strings.TEMPORARY
          : undefined,
      },
      {
        label: strings.LIVE_PLANTS,
        value: handleMissingData(getObservationSpeciesLivePlantsCount(monitoringPlotResult?.species)),
      },
      { label: strings.TOTAL_PLANTS, value: handleMissingData(monitoringPlotResult?.totalPlants) },
      { label: strings.SPECIES, value: handleMissingData(monitoringPlotResult?.totalSpecies) },
      { label: strings.PLANT_DENSITY, value: handleMissingData(monitoringPlotResult?.plantingDensity) },
      ...(monitoringPlotResult?.isPermanent
        ? [
            {
              label: strings.SURVIVAL_RATE,
              value: monitoringPlotResult?.isPermanent
                ? `${monitoringPlotResult?.survivalRate}%`
                : strings.NOT_CALCULATED_FOR_TEMPORARY_PLOTS,
            },
          ]
        : []),
      { label: strings.NUMBER_OF_PHOTOS, value: handleMissingData(monitoringPlotResult?.photos.length) },
      {
        label: strings.PLOT_CONDITIONS,
        value: monitoringPlotResult?.conditions.map((condition) => getConditionString(condition)).join(', ') || '- -',
      },
      { label: strings.FIELD_NOTES, value: monitoringPlotResult?.notes || '- -', text: true },
      {
        label: strings.PLOT_LOCATION,
        value: `${String(strings.formatString(String(strings.SW_CORNER_LATITUDE), String(swCoordinatesLat)))}\n${String(strings.formatString(String(strings.SW_CORNER_LONGITUDE), String(swCoordinatesLong)))}`,
        text: true,
      },
    ];
  }, [
    monitoringPlotResult,
    result?.completedTime,
    plantingSite?.timeZone,
    activeLocale,
    defaultTimeZone,
    stratum?.name,
    substratum?.name,
  ]);

  const mainTitle = useMemo(() => {
    const swCoordinatesLat = monitoringPlotResult?.boundary?.coordinates?.[0]?.[0]?.[0];
    const swCoordinatesLong = monitoringPlotResult?.boundary?.coordinates?.[0]?.[0]?.[1];

    return (
      <Box display='flex' alignItems={'end'}>
        <Typography fontSize='24px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
          {monitoringPlotResult?.monitoringPlotNumber.toString()}
        </Typography>
        <Tooltip
          placement='bottom'
          title={
            <Box>
              <Typography>
                {strings.STRATUM}: {stratum?.name}
              </Typography>
              <Typography>
                {strings.SUBSTRATUM}: {substratum?.name}
              </Typography>
              <Typography>
                {strings.PLOT_TYPE}:{' '}
                {monitoringPlotResult ? (monitoringPlotResult.isPermanent ? strings.PERMANENT : strings.TEMPORARY) : ''}
              </Typography>
              <Typography>
                {strings.LOCATION}: {swCoordinatesLat}, {swCoordinatesLong}
              </Typography>
            </Box>
          }
        >
          <Typography
            fontSize='16px'
            color={theme.palette.TwClrTxtBrand}
            fontWeight={400}
            paddingLeft={theme.spacing(1)}
          >
            {strings.PLOT_INFO}
          </Typography>
        </Tooltip>
      </Box>
    );
  }, [monitoringPlotResult, substratum?.name, stratum?.name, theme]);

  const title = useCallback(
    (text: string | ReactNode, marginTop?: number, marginBottom?: number) => (
      <Typography
        fontSize='20px'
        lineHeight='28px'
        fontWeight={600}
        color={theme.palette.TwClrTxt}
        margin={theme.spacing(marginTop ?? 3, 0, marginBottom ?? 2)}
      >
        {text}
      </Typography>
    ),
    [theme]
  );

  const goToSurvivalRateSettings = useCallback(
    () =>
      navigate({
        pathname: APP_PATHS.SURVIVAL_RATE_SETTINGS.replace(':plantingSiteId', plantingSiteId.toString()),
      }),
    [navigate, plantingSiteId]
  );

  const getReplacedPlotsNames = useCallback((): JSX.Element[] => {
    const names =
      monitoringPlotResult?.overlapsWithPlotIds.map((plotId, index) => {
        const allPlots = observationResults?.flatMap((obv) =>
          obv.strata.flatMap((_stratum) =>
            _stratum.substrata.flatMap((_substratum) =>
              _substratum.monitoringPlots.map((plot) => {
                return { ...plot, observationId: obv.observationId };
              })
            )
          )
        );
        const found = allPlots?.find((plot) => plot.monitoringPlotId === plotId);
        if (found) {
          return (
            <Link
              key={`plot-link-${index}`}
              to={APP_PATHS.OBSERVATION_MONITORING_PLOT_DETAILS.replace(
                ':plantingSiteId',
                Number(plantingSiteId).toString()
              )
                .replace(':observationId', Number(found.observationId).toString())
                .replace(':stratumName', encodeURIComponent(stratumName || ''))
                .replace(':monitoringPlotId', found.monitoringPlotId.toString())}
            >
              {found.monitoringPlotNumber}
            </Link>
          );
        }
        return undefined;
      }) || [];

    const elements = (names ?? []).filter((element): element is JSX.Element => element !== undefined);
    return elements;
  }, [monitoringPlotResult?.overlapsWithPlotIds, observationResults, plantingSiteId, stratumName]);

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    return [
      {
        id: 'observationData',
        label: strings.OBSERVATION_DATA,
        children: monitoringPlotResult ? (
          <ObservationDataTab
            monitoringPlot={monitoringPlotResult}
            species={monitoringPlotSpecies}
            observationId={observationId}
          />
        ) : null,
      },
      {
        id: 'photosAndVideos',
        label: strings.PHOTOS_AND_VIDEOS,
        children: (
          <PhotosAndVideosTab
            monitoringPlot={monitoringPlotResult}
            isCompleted={!!monitoringPlotResult?.completedTime}
            plantingSiteName={plantingSite?.name}
          />
        ),
      },
    ];
  }, [activeLocale, monitoringPlotResult, monitoringPlotSpecies, observationId, plantingSite]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'observationData',
    tabs,
    viewIdentifier: 'assignedObservations',
  });

  if (!plantingSiteId || !observationId) {
    return undefined;
  }

  return isEditObservationsEnabled ? (
    <DetailsPage
      title={mainTitle}
      plantingSiteId={Number(plantingSiteId)}
      observationId={Number(observationId)}
      stratumName={stratumName}
    >
      <Box width='100%'>
        <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
      </Box>
    </DetailsPage>
  ) : (
    <DetailsPage
      title={monitoringPlotResult?.monitoringPlotNumber.toString()}
      plantingSiteId={Number(plantingSiteId)}
      observationId={Number(observationId)}
      stratumName={stratumName}
      rightComponent={
        <OptionsMenu
          onOptionItemClick={goToSurvivalRateSettings}
          optionItems={[
            {
              label: strings.SURVIVAL_RATE_SETTINGS,
              value: 'survivalRate',
            },
          ]}
        />
      }
    >
      <Grid container>
        <Grid item xs={12}>
          <Card flushMobile>
            {title(strings.DETAILS, 1, 0)}
            <Grid container>
              {data.map((datum, index) => (
                <Grid key={index} item xs={gridSize} marginTop={2}>
                  <Textfield
                    id={`plot-observation-${index}`}
                    label={datum.label}
                    value={datum.value}
                    type={datum.text ? 'textarea' : 'text'}
                    preserveNewlines={true}
                    display={true}
                    tooltipTitle={datum.label === strings.SURVIVAL_RATE ? strings.SURVIVAL_RATE_COLUMN_TOOLTIP : ''}
                  />
                </Grid>
              ))}
              {monitoringPlotResult?.overlapsWithPlotIds && monitoringPlotResult.overlapsWithPlotIds.length > 0 && (
                <Grid item xs={gridSize} marginTop={2}>
                  <Box display={'flex'} alignItems={'center'}>
                    <Typography
                      fontSize='14px'
                      fontWeight={400}
                      color={theme.palette.TwClrTxtSecondary}
                      paddingRight={0.5}
                    >
                      {strings.PREVIOUS_25M_PLOTS}
                    </Typography>
                    <Tooltip title={strings.PREVIOUS_25M_PLOTS_TOOLTIP}>
                      <Box display='flex'>
                        <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
                      </Box>
                    </Tooltip>
                  </Box>
                  <Box paddingTop={1.5}>
                    {getReplacedPlotsNames().map((plotLink, index) => (
                      <Box key={`plot-link-${index}`}>{plotLink}</Box>
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
            {title(
              <Box display='flex'>
                {strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES}
                <IconTooltip title={strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES_TOOLTIP} />
              </Box>
            )}
            <Box height='360px'>
              <SpeciesTotalPlantsChart minHeight='360px' species={monitoringPlotSpecies} />
            </Box>
            <Box display='flex' alignItems={'center'}>
              {title(strings.SURVIVAL_RATE_PER_SPECIES_AS_OF_THIS_OBSERVATION)}
              <IconTooltip title={strings.SURVIVAL_RATE_PER_SPECIES_AS_OF_THIS_OBSERVATION_TOOLTIP} />
            </Box>
            <Box height='360px'>
              <SpeciesSurvivalRateChart
                minHeight='360px'
                species={monitoringPlotSpecies}
                isNotCompleted={!monitoringPlotResult?.completedTime}
                isTemporary={!monitoringPlotResult?.isPermanent}
              />
            </Box>

            {title(strings.PHOTOS)}
            <MonitoringPlotPhotos
              observationId={Number(observationId)}
              monitoringPlotId={Number(monitoringPlotId)}
              photos={monitoringPlotResult?.photos}
            />
          </Card>
        </Grid>
      </Grid>
    </DetailsPage>
  );
}
