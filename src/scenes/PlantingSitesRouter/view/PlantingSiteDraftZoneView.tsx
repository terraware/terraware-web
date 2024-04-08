import { useParams } from 'react-router-dom';

import { BusySpinner } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { selectDraftPlantingSite } from 'src/redux/features/draftPlantingSite/draftPlantingSiteSelectors';
import { searchDraftPlantingSiteSubzones } from 'src/redux/features/draftPlantingSite/draftPlantingSiteSelectors';
import useDraftPlantingSiteGet from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteGet';

import GenericZoneView from './GenericZoneView';

export default function PlantingSiteZoneView(): JSX.Element {
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const { status } = useDraftPlantingSiteGet({ draftId: Number(plantingSiteId) });

  if (status === 'pending') {
    return <BusySpinner />;
  }

  return (
    <GenericZoneView
      siteSelector={selectDraftPlantingSite}
      siteViewPrefix='/draft'
      siteViewUrl={APP_PATHS.PLANTING_SITES_DRAFT_VIEW}
      subzoneViewUrl={APP_PATHS.PLANTING_SITES_DRAFT_VIEW}
      zoneSelector={searchDraftPlantingSiteSubzones}
    />
  );
}
