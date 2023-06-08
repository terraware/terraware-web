import { useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import DetailsPage from 'src/components/Observations/common/DetailsPage';

export default function ObservationMonitoringPlotDetails(): JSX.Element {
  const { plantingSiteId, observationId, plantingZoneId, monitoringPlotId } = useParams<{
    plantingSiteId: string;
    observationId: string;
    plantingZoneId: string;
    monitoringPlotId: string;
  }>();

  const urlSite = APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', plantingSiteId?.toString());

  const urlDetails = `/${observationId}`;

  const urlZone = `/${plantingZoneId}`;

  return (
    <DetailsPage
      title='Observation Monitoring Plot Details placeholder title'
      crumbs={[
        { name: strings.OBSERVATIONS, to: urlSite },
        { name: 'observation name placeholder', to: urlDetails },
        { name: 'planting zone name placeholder', to: urlZone },
      ]}
    >
      <div>
        Observation details placeholder for planting site {plantingSiteId} observation {observationId} planting zone{' '}
        {plantingZoneId} monitoring plot {monitoringPlotId}
      </div>
    </DetailsPage>
  );
}
