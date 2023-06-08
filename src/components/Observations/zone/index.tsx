import { useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import PageFrame from 'src/components/Observations/common/PageFrame';

export default function ObservationPlantingZoneDetails(): JSX.Element {
  const { plantingSiteId, observationId, plantingZoneId } = useParams<{
    plantingSiteId: string;
    observationId: string;
    plantingZoneId: string;
  }>();

  const urlSite = () => APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', plantingSiteId?.toString());

  const urlDetails = () =>
    APP_PATHS.OBSERVATION_DETAILS.replace(':plantingSiteId', plantingSiteId?.toString()).replace(
      ':observationId',
      observationId?.toString()
    );

  return (
    <PageFrame
      title='Observation Planting Zone Details placeholder title'
      crumbs={[
        { name: strings.OBSERVATIONS, to: urlSite() },
        { name: 'observation name placeholder', to: urlDetails() },
      ]}
    >
      <div>
        Observation details placeholder for planting site {plantingSiteId} observation {observationId} planting zone{' '}
        {plantingZoneId}
      </div>
    </PageFrame>
  );
}
