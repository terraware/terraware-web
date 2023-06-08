import { useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import DetailsPage from 'src/components/Observations/common/DetailsPage';

export default function ObservationDetails(): JSX.Element {
  const { plantingSiteId, observationId } = useParams<{
    plantingSiteId: string;
    observationId: string;
  }>();

  const urlSite = APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', plantingSiteId?.toString());

  return (
    <DetailsPage title='Observation Details placeholder title' crumbs={[{ name: strings.OBSERVATIONS, to: urlSite }]}>
      <div>
        Observation details placeholder for planting site {plantingSiteId} observation {observationId}
      </div>
    </DetailsPage>
  );
}
