import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { BusySpinner } from '@terraware/web-components';
import { SiteType } from 'src/types/PlantingSite';
import { useLocalization } from 'src/providers';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { requestPlantingSite } from 'src/redux/features/tracking/trackingThunks';
import PlantingSiteEditor from 'src/scenes/PlantingSitesRouter/editor/Editor';

type PlantingSiteDraftEditProps = {
  reloadPlantingSites: () => void;
};

export default function PlantingSiteDraftEdit(props: PlantingSiteDraftEditProps): JSX.Element {
  const { reloadPlantingSites } = props;
  const { activeLocale } = useLocalization();
  const dispatch = useAppDispatch();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, Number(plantingSiteId)));

  useEffect(() => {
    const siteId = Number(plantingSiteId);
    if (!isNaN(siteId)) {
      // TODO fetch draft planting site once BE has API
      dispatch(requestPlantingSite(siteId, activeLocale));
    }
  }, [activeLocale, dispatch, plantingSiteId]);

  const siteType = useMemo<SiteType>(() => {
     // TODO: get planting site type when BE model has support
     if (plantingSite) {
       return 'simple';
     } else {
       return 'simple';
     }
  }, [plantingSite]);

  // TODO: handle error state?

  if (!plantingSite) {
    return <BusySpinner withSkrim={true} />;
  }

  return <PlantingSiteEditor reloadPlantingSites={reloadPlantingSites} site={plantingSite} siteType={siteType} />;
}
