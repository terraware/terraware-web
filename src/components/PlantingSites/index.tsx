import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Route, Switch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import { useOrganization } from 'src/providers';
import { useAppDispatch } from 'src/redux/store';
import { requestPlantingSiteObservationsResults } from 'src/redux/features/observations/observationsThunks';
import PlantingSiteCreate from './PlantingSiteCreate';
import PlantingSitesList from './PlantingSitesList';
import PlantingSiteView from './PlantingSiteView';
import PlantingSiteSubzoneView from './PlantingSiteSubzoneView';
import PlantingSiteZoneView from './PlantingSiteZoneView';

/**
 * This page will route to the correct component based on url params
 */
export type PlantingSitesProps = {
  reloadTracking: () => void;
};

export default function PlantingSites({ reloadTracking }: PlantingSitesProps): JSX.Element {
  return (
    <Switch>
      <Route path={APP_PATHS.PLANTING_SITES_NEW}>
        <PlantingSiteCreate reloadPlantingSites={reloadTracking} />
      </Route>
      <Route path={APP_PATHS.PLANTING_SITES_VIEW}>
        <PlantingSitesWrapper reloadTracking={reloadTracking} />
      </Route>
      <Route path={'*'}>
        <PlantingSitesList />
      </Route>
    </Switch>
  );
}

export function PlantingSitesWrapper({ reloadTracking }: PlantingSitesProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const dispatch = useAppDispatch();
  const trackingV2 = isEnabled('TrackingV2');

  useEffect(() => {
    const siteId = Number(plantingSiteId);
    if (!isNaN(siteId) && trackingV2) {
      dispatch(requestPlantingSiteObservationsResults(selectedOrganization.id, siteId));
    }
  }, [dispatch, selectedOrganization.id, plantingSiteId, trackingV2]);

  return (
    <Switch>
      {trackingV2 && (
        <Route path={APP_PATHS.PLANTING_SITES_SUBZONE_VIEW}>
          <PlantingSiteSubzoneView />
        </Route>
      )}
      {trackingV2 && (
        <Route path={APP_PATHS.PLANTING_SITES_ZONE_VIEW}>
          <PlantingSiteZoneView />
        </Route>
      )}
      <Route path={APP_PATHS.PLANTING_SITES_EDIT}>
        <PlantingSiteCreate reloadPlantingSites={reloadTracking} />
      </Route>
      <Route path={APP_PATHS.PLANTING_SITES_VIEW}>
        <PlantingSiteView />
      </Route>
    </Switch>
  );
}
