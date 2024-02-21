import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BusySpinner } from '@terraware/web-components';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { PlantingSite } from 'src/types/Tracking';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { searchPlantingSiteZones } from 'src/redux/features/observations/plantingSiteDetailsSelectors';
import { requestPlantingSite } from 'src/redux/features/tracking/trackingThunks';
import DeletePlantingSiteModal from 'src/scenes/PlantingSitesRouter/edit/DeletePlantingSiteModal';
import GenericSiteView from './GenericSiteView';

export default function PlantingSiteView(): JSX.Element {
  const { activeLocale } = useLocalization();
  const dispatch = useAppDispatch();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, Number(plantingSiteId)));
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const siteId = Number(plantingSiteId);
    if (!isNaN(siteId)) {
      dispatch(requestPlantingSite(siteId, activeLocale));
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
