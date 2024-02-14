import { useParams } from 'react-router-dom';
import { BusySpinner } from '@terraware/web-components';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import { APP_PATHS } from 'src/constants';
import { useUser } from 'src/providers';
import useDraftPlantingSite from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSite';
import GenericSiteView from './GenericSiteView';

export default function PlantingSiteDraftView(): JSX.Element {
  const { user } = useUser();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const result = useDraftPlantingSite({ draftId: Number(plantingSiteId) });

  if (result.site !== undefined) {
    return (
      <GenericSiteView<DraftPlantingSite>
        editDisabled={!user || result.site.createdBy !== user.id}
        editUrl={APP_PATHS.PLANTING_SITES_DRAFT_EDIT}
        onDelete={() => window.alert('WIP')}
        plantingSite={result.site}
      />
    );
  }

  return <BusySpinner withSkrim={true} />;
}
