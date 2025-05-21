import React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router';

import { BusySpinner } from '@terraware/web-components';

import TfMain from 'src/components/common/TfMain';
// import { APP_PATHS } from 'src/constants';
// import { useUser } from 'src/providers';
import DeleteDraftPlantingSiteModal from 'src/scenes/PlantingSitesRouter/edit/DeleteDraftPlantingSiteModal';
import useDraftPlantingSite from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteGet';

// import GenericSiteView from './GenericSiteView';

export default function PlantingSiteDraftView(): JSX.Element {
  // const { user } = useUser();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const result = useDraftPlantingSite({ draftId: Number(plantingSiteId) });
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

  if (result.site !== undefined) {
    return (
      <TfMain>
        {deleteModalOpen && (
          <DeleteDraftPlantingSiteModal plantingSite={result.site} onClose={() => setDeleteModalOpen(false)} />
        )}
        {/* <GenericSiteView
          editDisabled={!user || result.site.createdBy !== user.id}
          editUrl={APP_PATHS.PLANTING_SITES_DRAFT_EDIT}
          onDelete={() => setDeleteModalOpen(true)}
          plantingSite={result.site}
          zoneViewUrl={APP_PATHS.PLANTING_SITES_DRAFT_ZONE_VIEW}
        /> */}
      </TfMain>
    );
  }

  return <BusySpinner withSkrim={true} />;
}
