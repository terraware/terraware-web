import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import { getShortDate } from 'src/utils/dateFormatter';
import { useLocalization } from 'src/providers';
import { useAppSelector } from 'src/redux/store';
import { selectObservationMonitoringPlot } from 'src/redux/features/observations/observationMonitoringPlotSelectors';
import { selectObservationPlantingZone } from 'src/redux/features/observations/observationPlantingZoneSelectors';
import { selectObservationDetails } from 'src/redux/features/observations/observationDetailsSelectors';
import DetailsPage from 'src/components/Observations/common/DetailsPage';

export default function ObservationMonitoringPlot(): JSX.Element {
  const { plantingSiteId, observationId, plantingZoneId, monitoringPlotId } = useParams<{
    plantingSiteId: string;
    observationId: string;
    plantingZoneId: string;
    monitoringPlotId: string;
  }>();
  const { activeLocale } = useLocalization();
  const defaultTimeZone = useDefaultTimeZone();

  const urlSite = APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', plantingSiteId?.toString());

  const urlDetails = `/${observationId}`;

  const urlPlantingZone = `/${plantingZoneId}`;

  const monitoringPlot = useAppSelector((state) =>
    selectObservationMonitoringPlot(
      state,
      {
        plantingSiteId: Number(plantingSiteId),
        observationId: Number(observationId),
        plantingZoneId: Number(plantingZoneId),
        monitoringPlotId: Number(monitoringPlotId),
      },
      defaultTimeZone.get()
    )
  );

  const plantingZone = useAppSelector((state) =>
    selectObservationPlantingZone(
      state,
      {
        plantingSiteId: Number(plantingSiteId),
        observationId: Number(observationId),
        plantingZoneId: Number(plantingZoneId),
      },
      defaultTimeZone.get()
    )
  );

  const details = useAppSelector((state) =>
    selectObservationDetails(
      state,
      {
        plantingSiteId: Number(plantingSiteId),
        observationId: Number(observationId),
      },
      defaultTimeZone.get()
    )
  );

  const crumbName = useMemo(() => {
    const plantingSiteName = details?.plantingSiteName ?? '';
    const completionDate = details?.completedTime ? getShortDate(details.completedTime, activeLocale) : '';
    return `${completionDate} (${plantingSiteName})`;
  }, [activeLocale, details]);

  return (
    <DetailsPage
      title={monitoringPlot?.monitoringPlotName ?? ''}
      crumbs={[
        { name: strings.OBSERVATIONS, to: urlSite },
        { name: crumbName, to: urlDetails },
        { name: plantingZone?.plantingZoneName ?? '', to: urlPlantingZone },
      ]}
    >
      <Box display='flex' flexGrow={1} flexDirection='column'>
        <Box margin={1}>TODO: add info cards and charts here for monitoring plot {monitoringPlotId}</Box>
      </Box>
    </DetailsPage>
  );
}
