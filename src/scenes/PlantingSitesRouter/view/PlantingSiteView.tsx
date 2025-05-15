import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { BusySpinner } from '@terraware/web-components';

import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import DeletePlantingSiteModal from 'src/scenes/PlantingSitesRouter/edit/DeletePlantingSiteModal';
import { PlantingSite } from 'src/types/Tracking';

import GenericSiteView from './GenericSiteView';

export default function PlantingSiteView(): JSX.Element {
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

  const { plantingSite, setSelectedPlantingSite, observationSummaries, plantingSiteReportedPlants } =
    usePlantingSiteData();

  useEffect(() => {
    const siteId = Number(plantingSiteId);
    setSelectedPlantingSite(siteId);
  }, [plantingSiteId, setSelectedPlantingSite]);

  const hasPlantings = useMemo(() => {
    if (plantingSiteReportedPlants) {
      return plantingSiteReportedPlants.totalPlants > 0;
    } else {
      return false;
    }
  }, [plantingSiteReportedPlants]);

  return (
    <TfMain>
      {deleteModalOpen && plantingSite && (
        <DeletePlantingSiteModal
          plantingSite={plantingSite}
          hasPlantings={hasPlantings}
          onClose={() => setDeleteModalOpen(false)}
        />
      )}
      {plantingSite === undefined && <BusySpinner withSkrim={true} />}
      {plantingSite !== undefined && (
        <GenericSiteView<PlantingSite>
          editUrl={APP_PATHS.PLANTING_SITES_EDIT}
          onDelete={() => setDeleteModalOpen(true)}
          plantingSite={plantingSite}
          selector={searchPlantingSiteZones}
          zoneViewUrl={APP_PATHS.PLANTING_SITES_ZONE_VIEW}
        />
      )}
    </TfMain>
  );
}
