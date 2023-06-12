import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo;
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import { useAppSelector } from 'src/redux/store';
import { selectObservationMonitoringPlot } from 'src/redux/features/observations/observationMonitoringPlotSelectors';
import DetailsPage from 'src/components/Observations/common/DetailsPage';

export default function ObservationMonitoringPlot(): JSX.Element {
  const { plantingSiteId, observationId, plantingZoneId, monitoringPlotId } = useParams<{
    plantingSiteId: string;
    observationId: string;
    plantingZoneId: string;
    monitoringPlotId: string;
  }>();
  const defaultTimeZone = useDefaultTimeZone();
  const { isMobile } = useDeviceInfo();

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

  const gridSize = isMobile ? 12 : 4;

  const data: Record<string, any>[] = useMemo(() => [
    { label: strings.DATE, value: monitoringPlot?.completedDate },
    { label: strings.TIME, value: monitoringPlot?.completedTime },
    { label: strings.OBSERVER, value: monitoringPlot?.claimedByName },
    { label: strings.ZONE, value: monitoringPlot?.plantingZoneName },
    { label: strings.SUBZONE, value: monitoringPlot?.plantingSubzoneName },
    { label: strings.MONITORING_PLOT_TYPE, value: monitoringPlot ? (monitoringPlot.isPermanent ? strings.PERMANENT : strings.TEMPORARY) : '' },
    { label: strings.PLANTS, value: monitoringPlot?.totalPlants },
    { label: strings.SPECIES, value: monitoringPlot?.totalSpecies },
    { label: strings.PLANTING_DENSITY, value: monitoringPlot?.plantingDensity },
    { label: strings.MORTALITY_RATE, value: monitoringPlot?.mortalityRate },
    { label: strings.NUMBER_OF_PHOTOS, value: monitoringPlot?.photos.length },
    { label: strings.FIELD_NOTES, value: monitoringPlot?.notes, text: true },
  ], [monitoringPlot]);

  return (
    <DetailsPage
      title={monitoringPlot?.monitoringPlotName ?? ''}
      plantingSiteId={plantingSiteId}
      observationId={observationId}
      plantingZoneId={plantingZoneId}
    >
      <Box display='flex' flexGrow={1} flexDirection='column'>
        <Grid container>
        </Grid>
      </Box>
    </DetailsPage>
  );
}
