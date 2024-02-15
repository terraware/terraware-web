import { APP_PATHS } from 'src/constants';
import { selectDraftPlantingSite } from 'src/redux/features/draftPlantingSite/draftPlantingSiteSelectors';
import { selectDraftPlantingSiteSubzone } from 'src/redux/features/draftPlantingSite/draftPlantingSiteSelectors';
import GenericSubzoneView from './GenericSubzoneView';

export default function PlantingSiteZoneView(): JSX.Element {
  return (
    <GenericSubzoneView
      siteSelector={selectDraftPlantingSite}
      siteViewPrefix='/drafts'
      siteViewUrl={APP_PATHS.PLANTING_SITES_DRAFT_VIEW}
      subzoneSelector={selectDraftPlantingSiteSubzone}
      zoneViewUrl={APP_PATHS.PLANTING_SITES_DRAFT_ZONE_VIEW}
    />
  );
}
