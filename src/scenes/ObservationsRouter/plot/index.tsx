import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Grid, Tooltip, Typography, useTheme } from '@mui/material';
import { Icon, Textfield } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { selectObservationMonitoringPlot } from 'src/redux/features/observations/observationMonitoringPlotSelectors';
import { selectObservationsResults } from 'src/redux/features/observations/observationsSelectors';
import { getConditionString } from 'src/redux/features/observations/utils';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import DetailsPage from 'src/scenes/ObservationsRouter/common/DetailsPage';
import SpeciesMortalityRateChart from 'src/scenes/ObservationsRouter/common/SpeciesMortalityRateChart';
import SpeciesTotalPlantsChart from 'src/scenes/ObservationsRouter/common/SpeciesTotalPlantsChart';
import strings from 'src/strings';
import { getShortTime } from 'src/utils/dateFormatter';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import MonitoringPlotPhotos from './MonitoringPlotPhotos';

export default function ObservationMonitoringPlot(): JSX.Element {
  const { plantingSiteId, observationId, plantingZoneId, monitoringPlotId } = useParams<{
    plantingSiteId: string;
    observationId: string;
    plantingZoneId: string;
    monitoringPlotId: string;
  }>();
  const defaultTimeZone = useDefaultTimeZone();
  const navigate = useNavigate();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const allObservationsResults = useAppSelector(selectObservationsResults);
  const observationsResults = useMemo(() => {
    if (!allObservationsResults || !plantingSiteId) {
      return [];
    }
    return allObservationsResults?.filter((observationResult) => {
      const matchesSite =
        plantingSiteId !== '-1' ? observationResult.plantingSiteId.toString() === plantingSiteId : true;
      return matchesSite;
    });
  }, [allObservationsResults, plantingSiteId]);

  const monitoringPlot = useAppSelector((state) =>
    selectObservationMonitoringPlot(
      state,
      {
        plantingSiteId: Number(plantingSiteId),
        observationId: Number(observationId),
        plantingZoneId: Number(plantingZoneId),
        monitoringPlotId: Number(monitoringPlotId),
      },
      defaultTimeZone.get().id
    )
  );

  const plantingSite = useAppSelector((state) => selectPlantingSite(state, Number(plantingSiteId)));

  const gridSize = isMobile ? 12 : 4;

  const data: Record<string, any>[] = useMemo(() => {
    const handleMissingData = (num?: number) => (!monitoringPlot?.completedTime && !num ? '' : num);

    return [
      { label: strings.DATE, value: monitoringPlot?.completedDate },
      {
        label: strings.TIME,
        value: monitoringPlot?.completedTime
          ? getShortTime(
              monitoringPlot?.completedTime,
              activeLocale,
              plantingSite?.timeZone || defaultTimeZone.get().id
            )
          : undefined,
      },
      { label: strings.OBSERVER, value: monitoringPlot?.claimedByName },
      { label: strings.ZONE, value: monitoringPlot?.plantingZoneName },
      { label: strings.SUBZONE, value: monitoringPlot?.plantingSubzoneName },
      {
        label: strings.MONITORING_PLOT_TYPE,
        value: monitoringPlot ? (monitoringPlot.isPermanent ? strings.PERMANENT : strings.TEMPORARY) : undefined,
      },
      { label: strings.PLANTS, value: handleMissingData(monitoringPlot?.totalPlants) },
      { label: strings.SPECIES, value: handleMissingData(monitoringPlot?.totalSpecies) },
      { label: strings.PLANTING_DENSITY, value: handleMissingData(monitoringPlot?.plantingDensity) },
      ...(monitoringPlot?.isPermanent
        ? [{ label: strings.MORTALITY_RATE, value: handleMissingData(monitoringPlot?.mortalityRate) }]
        : []),
      { label: strings.NUMBER_OF_PHOTOS, value: handleMissingData(monitoringPlot?.photos.length) },
      {
        label: strings.PLOT_CONDITIONS,
        value: monitoringPlot?.conditions.map((condition) => getConditionString(condition)).join(', '),
      },
      { label: strings.FIELD_NOTES, value: monitoringPlot?.notes, text: true },
    ];
  }, [activeLocale, defaultTimeZone, monitoringPlot, plantingSite]);

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
    if (!monitoringPlot) {
      navigate(
        APP_PATHS.OBSERVATION_PLANTING_ZONE_DETAILS.replace(':plantingSiteId', Number(plantingSiteId).toString())
          .replace(':observationId', Number(observationId).toString())
          .replace(':plantingZoneId', Number(plantingZoneId).toString())
      );
    }
  }, [navigate, monitoringPlot, observationId, plantingZoneId, plantingSiteId]);

  const getReplacedPlotsNames = (): JSX.Element[] => {
    const names =
      monitoringPlot?.overlapsWithPlotIds.map((plotId, index) => {
        const allPlots = observationsResults.flatMap((obv) =>
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
                .replace(':plantingZoneId', Number(plantingZoneId).toString())
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

  return (
    <DetailsPage
      title={monitoringPlot?.monitoringPlotNumber.toString() ?? ''}
      plantingSiteId={plantingSiteId}
      observationId={observationId}
      plantingZoneId={plantingZoneId}
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
              {monitoringPlot?.overlapsWithPlotIds && monitoringPlot.overlapsWithPlotIds.length > 0 && (
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
              <SpeciesTotalPlantsChart minHeight='360px' species={monitoringPlot?.species} />
            </Box>
            {monitoringPlot?.isPermanent && (
              <>
                {title(strings.MORTALITY_RATE_PER_SPECIES)}
                <Box height='360px'>
                  <SpeciesMortalityRateChart minHeight='360px' species={monitoringPlot?.species} />
                </Box>
              </>
            )}
            {title(strings.PHOTOS)}
            <MonitoringPlotPhotos
              observationId={Number(observationId)}
              monitoringPlotId={Number(monitoringPlotId)}
              photos={monitoringPlot?.photos}
            />
          </Card>
        </Grid>
      </Grid>
    </DetailsPage>
  );
}
