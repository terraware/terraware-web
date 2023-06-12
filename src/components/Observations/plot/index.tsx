import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
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

  return (
    <DetailsPage
      title={monitoringPlot?.monitoringPlotName ?? ''}
      plantingSiteId={plantingSiteId}
      observationId={observationId}
      plantingZoneId={plantingZoneId}
    >
      <Box display='flex' flexGrow={1} flexDirection='column'>
        <Box margin={1}>TODO: add info cards and charts here for monitoring plot {monitoringPlotId}</Box>
      </Box>
    </DetailsPage>
  );
}
