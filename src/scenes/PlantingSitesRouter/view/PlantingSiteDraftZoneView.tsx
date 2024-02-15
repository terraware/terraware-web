import { APP_PATHS } from 'src/constants';
import { selectDraftPlantingSite } from 'src/redux/features/draftPlantingSite/draftPlantingSiteSelectors';
import { searchDraftPlantingSiteSubzones } from 'src/redux/features/draftPlantingSite/draftPlantingSiteSelectors';
import GenericZoneView from './GenericZoneView';

export default function PlantingSiteZoneView(): JSX.Element {
  return (
    <GenericZoneView
      siteSelector={selectDraftPlantingSite}
      siteViewPrefix='/drafts'
      siteViewUrl={APP_PATHS.PLANTING_SITES_DRAFT_VIEW}
      subzoneViewUrl={APP_PATHS.PLANTING_SITES_DRAFT_SUBZONE_VIEW}
      zoneSelector={searchDraftPlantingSiteSubzones}
    />
  );
}
