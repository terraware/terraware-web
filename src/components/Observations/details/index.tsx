import { useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import PageFrame from 'src/components/Observations/common/PageFrame';

export default function ObservationDetails(): JSX.Element {
  const { plantingSiteId, observationId } = useParams<{
    plantingSiteId: string;
    observationId: string;
  }>();

  const urlSite = () => APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', plantingSiteId?.toString());

  return (
    <PageFrame title='Observation Details placeholder title' crumbs={[{ name: strings.OBSERVATIONS, to: urlSite() }]}>
      <div>
        Observation details placeholder for planting site {plantingSiteId} observation {observationId}
      </div>
    </PageFrame>
  );
}
