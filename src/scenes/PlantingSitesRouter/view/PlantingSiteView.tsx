import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { BusySpinner } from '@terraware/web-components';

import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import { requestAdHocObservationsResults } from 'src/redux/features/observations/observationsThunks';
import { searchPlantingSiteZones } from 'src/redux/features/observations/plantingSiteDetailsSelectors';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { requestPlantingSite } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import DeletePlantingSiteModal from 'src/scenes/PlantingSitesRouter/edit/DeletePlantingSiteModal';
import { PlantingSite } from 'src/types/Tracking';

import GenericSiteView from './GenericSiteView';

export default function PlantingSiteView(): JSX.Element {
  const { activeLocale } = useLocalization();
  const dispatch = useAppDispatch();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, Number(plantingSiteId)));
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const { selectedOrganization } = useOrganization();

  useEffect(() => {
    const siteId = Number(plantingSiteId);
    if (!isNaN(siteId)) {
      void dispatch(requestPlantingSite(siteId, activeLocale));
      void dispatch(requestAdHocObservationsResults(selectedOrganization.id));
    }
  }, [activeLocale, dispatch, plantingSiteId]);

  return (
    <TfMain>
      {deleteModalOpen && plantingSite && (
        <DeletePlantingSiteModal plantingSite={plantingSite} onClose={() => setDeleteModalOpen(false)} />
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
