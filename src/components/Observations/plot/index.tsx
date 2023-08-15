import { useEffect, useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { getShortTime } from 'src/utils/dateFormatter';
import { useLocalization } from 'src/providers';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import { useAppSelector } from 'src/redux/store';
import { selectObservationMonitoringPlot } from 'src/redux/features/observations/observationMonitoringPlotSelectors';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import Card from 'src/components/common/Card';
import DetailsPage from 'src/components/Observations/common/DetailsPage';
import SpeciesTotalPlantsChart from 'src/components/Observations/common/SpeciesTotalPlantsChart';
import SpeciesMortalityRateChart from 'src/components/Observations/common/SpeciesMortalityRateChart';
import MonitoringPlotPhotos from './MonitoringPlotPhotos';

export default function ObservationMonitoringPlot(): JSX.Element {
  const { plantingSiteId, observationId, plantingZoneId, monitoringPlotId } = useParams<{
    plantingSiteId: string;
    observationId: string;
    plantingZoneId: string;
    monitoringPlotId: string;
  }>();
  const defaultTimeZone = useDefaultTimeZone();
  const history = useHistory();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();

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

  const data: Record<string, any>[] = useMemo(
    () => [
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
      { label: strings.PLANTS, value: monitoringPlot?.totalPlants },
      { label: strings.SPECIES, value: monitoringPlot?.totalSpecies },
      { label: strings.PLANTING_DENSITY, value: monitoringPlot?.plantingDensity },
      ...(monitoringPlot?.isPermanent ? [{ label: strings.MORTALITY_RATE, value: monitoringPlot?.mortalityRate }] : []),
      { label: strings.NUMBER_OF_PHOTOS, value: monitoringPlot?.photos.length },
      { label: strings.FIELD_NOTES, value: monitoringPlot?.notes, text: true },
    ],
    [activeLocale, defaultTimeZone, monitoringPlot, plantingSite]
  );

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
      history.push(
        APP_PATHS.OBSERVATION_PLANTING_ZONE_DETAILS.replace(':plantingSiteId', Number(plantingSiteId).toString())
          .replace(':observationId', Number(observationId).toString())
          .replace(':plantingZoneId', Number(plantingZoneId).toString())
      );
    }
  }, [history, monitoringPlot, observationId, plantingZoneId, plantingSiteId]);

  return (
    <DetailsPage
      title={monitoringPlot?.monitoringPlotName ?? ''}
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
