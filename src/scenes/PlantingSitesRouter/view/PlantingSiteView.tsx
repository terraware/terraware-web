import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { BusySpinner } from '@terraware/web-components';

import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import DeletePlantingSiteModal from 'src/scenes/PlantingSitesRouter/edit/DeletePlantingSiteModal';

import GenericSiteView from './GenericSiteView';

export default function PlantingSiteView(): JSX.Element {
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

  const { plantingSite, setSelectedPlantingSite } = usePlantingSiteData();

  useEffect(() => {
    const siteId = Number(plantingSiteId);
    setSelectedPlantingSite(siteId);
  }, [plantingSiteId, setSelectedPlantingSite]);

  return (
    <TfMain>
      {deleteModalOpen && plantingSite && (
        <DeletePlantingSiteModal plantingSite={plantingSite} onClose={() => setDeleteModalOpen(false)} />
      )}
      {plantingSite === undefined && <BusySpinner withSkrim={true} />}
      {plantingSite !== undefined && (
        <GenericSiteView
          editUrl={APP_PATHS.PLANTING_SITES_EDIT}
          onDelete={() => setDeleteModalOpen(true)}
          plantingSite={plantingSite}
          zoneViewUrl={APP_PATHS.PLANTING_SITES_ZONE_VIEW}
        />
      )}
    </TfMain>
  );
}
