import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, Tooltip, Typography, useTheme } from '@mui/material';
import { Icon, Textfield } from '@terraware/web-components';
import getDateDisplayValue from '@terraware/web-components/utils/date';

import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { getConditionString } from 'src/redux/features/observations/utils';
import DetailsPage from 'src/scenes/ObservationsRouter/common/DetailsPage';
import MonitoringPlotPhotos from 'src/scenes/ObservationsRouter/common/MonitoringPlotPhotos';
import SpeciesMortalityRateChart from 'src/scenes/ObservationsRouter/common/SpeciesMortalityRateChart';
import SpeciesTotalPlantsChart from 'src/scenes/ObservationsRouter/common/SpeciesTotalPlantsChart';
import strings from 'src/strings';
import {
  ObservationMonitoringPlotResultsPayload,
  ObservationPlantingSubzoneResultsPayload,
  ObservationPlantingZoneResultsPayload,
  ObservationSpeciesResults,
} from 'src/types/Observations';
import { getShortTime } from 'src/utils/dateFormatter';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

export default function ObservationMonitoringPlot(): JSX.Element | undefined {
  const params = useParams<{
    plantingSiteId: string;
    observationId: string;
    plantingZoneName: string;
    monitoringPlotId: string;
  }>();

  const plantingSiteId = Number(params.plantingSiteId);
  const observationId = Number(params.observationId);
  const plantingZoneName = params.plantingZoneName;
  const monitoringPlotId = Number(params.monitoringPlotId);

  const defaultTimeZone = useDefaultTimeZone();
  const navigate = useSyncNavigate();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();

  const { species } = useSpeciesData();
  const { plantingSite, adHocObservationResults, observationResults } = usePlantingSiteData();
  const [plantingZoneResult, setPlantingZoneResult] = useState<ObservationPlantingZoneResultsPayload>();
  const [plantingSubzoneResult, setPlantingSubzoneResult] = useState<ObservationPlantingSubzoneResultsPayload>();
  const [monitoringPlotResult, setMonitoringPlotResult] = useState<ObservationMonitoringPlotResultsPayload>();

  const result = useMemo(() => {
    if (!Number.isNaN(Number(observationId))) {
      return (
        observationResults?.find((_result) => _result.observationId === Number(observationId)) ??
        adHocObservationResults?.find((_result) => _result.observationId === Number(observationId))
      );
    }
  }, [observationResults, observationId]);

  useEffect(() => {
    if (result) {
      result.plantingZones.forEach((zone) =>
        zone.plantingSubzones.forEach((subzone) =>
          subzone.monitoringPlots.forEach((plot) => {
            if (plot.monitoringPlotId === monitoringPlotId) {
              setPlantingZoneResult(zone);
              setPlantingSubzoneResult(subzone);
              setMonitoringPlotResult(plot);
            }
          })
        )
      );
    }
  }, [result, monitoringPlotId]);

  const plantingZone = useMemo(() => {
    if (plantingZoneResult) {
      return plantingSite?.plantingZones?.find((zone) => zone.id === plantingZoneResult.plantingZoneId);
    }
  }, [plantingSite, plantingZoneResult]);

  const plantingSubzone = useMemo(() => {
    if (plantingSubzoneResult) {
      return plantingZone?.plantingSubzones?.find((subzone) => subzone.id === plantingSubzoneResult.plantingSubzoneId);
    }
  }, [plantingZone, plantingSubzoneResult]);

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
        value: result?.completedTime ? getDateDisplayValue(result.completedTime, plantingSite?.timeZone) : undefined,
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
      { label: strings.ZONE, value: plantingZone?.name },
      { label: strings.SUBZONE, value: plantingSubzone?.name },
      {
        label: strings.MONITORING_PLOT_TYPE,
        value: monitoringPlotResult
          ? monitoringPlotResult.isPermanent
            ? strings.PERMANENT
            : strings.TEMPORARY
          : undefined,
      },
      { label: strings.PLANTS, value: handleMissingData(monitoringPlotResult?.totalPlants) },
      { label: strings.SPECIES, value: handleMissingData(monitoringPlotResult?.totalSpecies) },
      { label: strings.PLANTING_DENSITY, value: handleMissingData(monitoringPlotResult?.plantingDensity) },
      ...(monitoringPlotResult?.isPermanent
        ? [{ label: strings.MORTALITY_RATE, value: handleMissingData(monitoringPlotResult?.mortalityRate) }]
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
  }, [activeLocale, defaultTimeZone, monitoringPlotResult, plantingSite, plantingZone, plantingSubzone]);

  const title = (text: string, marginTop?: number, marginBottom?: number) => (
    <Typography
      fontSize='20px'
      lineHeight='28px'
      fontWeight={600}
      color={theme.palette.TwClrTxt}
      margin={theme.spacing(marginTop ?? 3, 0, marginBottom ?? 2)}
    >
      {text}
    </Typography>
  );

  useEffect(() => {
    if (plantingZoneName && !monitoringPlotResult) {
      navigate(
        APP_PATHS.OBSERVATION_PLANTING_ZONE_DETAILS.replace(':plantingSiteId', plantingSiteId.toString())
          .replace(':observationId', Number(observationId).toString())
          .replace(':plantingZoneName', encodeURIComponent(plantingZoneName))
      );
    }
  }, [navigate, monitoringPlotResult, observationId, plantingZoneName, plantingSiteId]);

  const getReplacedPlotsNames = (): JSX.Element[] => {
    const names =
      monitoringPlotResult?.overlapsWithPlotIds.map((plotId, index) => {
        const allPlots = observationResults?.flatMap((obv) =>
          obv.plantingZones.flatMap((pz) =>
            pz.plantingSubzones.flatMap((subzone) =>
              subzone.monitoringPlots.map((plot) => {
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
                .replace(':plantingZoneName', encodeURIComponent(plantingZoneName || ''))
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
  };

  if (!plantingSiteId || !observationId) {
    return undefined;
  }

  return (
    <DetailsPage
      title={monitoringPlotResult?.monitoringPlotNumber.toString() ?? ''}
      plantingSiteId={Number(plantingSiteId)}
      observationId={Number(observationId)}
      plantingZoneName={plantingZoneName}
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
            {title(strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES)}
            <Box height='360px'>
              <SpeciesTotalPlantsChart minHeight='360px' species={monitoringPlotSpecies} />
            </Box>
            {monitoringPlotResult?.isPermanent && (
              <>
                {title(strings.MORTALITY_RATE_PER_SPECIES)}
                <Box height='360px'>
                  <SpeciesMortalityRateChart minHeight='360px' species={monitoringPlotSpecies} />
                </Box>
              </>
            )}
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
