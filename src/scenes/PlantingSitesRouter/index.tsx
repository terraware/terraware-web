import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Route, Switch } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
import { requestPlantingSiteObservationsResults } from 'src/redux/features/observations/observationsThunks';
import {
  selectPlantingSiteObservationsResults,
  selectPlantingSiteObservationsResultsError,
} from 'src/redux/features/observations/plantingSiteDetailsSelectors';
import { selectPlantingSites, selectPlantingSitesError } from 'src/redux/features/tracking/trackingSelectors';
import PlantingSiteCreate from './edit/PlantingSiteCreate';
import PlantingSitesList from './view/PlantingSitesList';
import PlantingSiteView from './view/PlantingSiteView';
import PlantingSiteSubzoneView from './view/PlantingSiteSubzoneView';
import PlantingSiteZoneView from './view/PlantingSiteZoneView';
import PlantingSiteDraftCreate from './edit/PlantingSiteDraftCreate';
import PlantingSiteDraftEdit from './edit/PlantingSiteDraftEdit';
import PlantingSiteDraftView from './view/PlantingSiteDraftView';
import PlantingSiteDraftZoneView from './view/PlantingSiteDraftZoneView';
import isEnabled from 'src/features';

/**
 * This page will route to the correct component based on url params
 */
export type PlantingSitesProps = {
  reloadTracking: () => void;
};

export default function PlantingSites({ reloadTracking }: PlantingSitesProps): JSX.Element {
  const userDrawnDetailedSites = isEnabled('User Detailed Sites');

  return (
    <Switch>
      <Route path={APP_PATHS.PLANTING_SITES_NEW}>
        <PlantingSiteCreate reloadPlantingSites={reloadTracking} />
      </Route>
      {userDrawnDetailedSites && (
        <Route path={APP_PATHS.PLANTING_SITES_DRAFT_VIEW}>
          <PlantingSitesDraftRouter />
        </Route>
      )}
      <Route path={APP_PATHS.PLANTING_SITES_VIEW}>
        <PlantingSitesRouter reloadTracking={reloadTracking} />
      </Route>
      <Route path={'*'}>
        <PlantingSitesList />
      </Route>
    </Switch>
  );
}

export function PlantingSitesRouter({ reloadTracking }: PlantingSitesProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const dispatch = useAppDispatch();

  const observationsResults = useAppSelector((state) =>
    selectPlantingSiteObservationsResults(state, Number(plantingSiteId))
  );
  const observationsResultsError = useAppSelector((state) =>
    selectPlantingSiteObservationsResultsError(state, Number(plantingSiteId))
  );

  const plantingSites = useAppSelector(selectPlantingSites);
  const plantingSitesError = useAppSelector(selectPlantingSitesError);

  useEffect(() => {
    const siteId = Number(plantingSiteId);
    if (!isNaN(siteId)) {
      dispatch(requestPlantingSiteObservationsResults(selectedOrganization.id, siteId));
      dispatch(requestPlantings(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization.id, plantingSiteId]);

  // show spinner while initializing data
  if (
    (observationsResults === undefined && !observationsResultsError) ||
    (plantingSites === undefined && !plantingSitesError)
  ) {
    return <CircularProgress sx={{ margin: 'auto' }} />;
  }

  return (
    <Switch>
      <Route path={APP_PATHS.PLANTING_SITES_SUBZONE_VIEW}>
        <PlantingSiteSubzoneView />
      </Route>
      <Route path={APP_PATHS.PLANTING_SITES_ZONE_VIEW}>
        <PlantingSiteZoneView />
      </Route>
      <Route path={APP_PATHS.PLANTING_SITES_EDIT}>
        <PlantingSiteCreate reloadPlantingSites={reloadTracking} />
      </Route>
      <Route path={APP_PATHS.PLANTING_SITES_VIEW}>
        <PlantingSiteView />
      </Route>
    </Switch>
  );
}

export function PlantingSitesDraftRouter(): JSX.Element {
  return (
    <Switch>
      <Route path={APP_PATHS.PLANTING_SITES_DRAFT_ZONE_VIEW}>
        <PlantingSiteDraftZoneView />
      </Route>
      <Route path={APP_PATHS.PLANTING_SITES_DRAFT_NEW}>
        <PlantingSiteDraftCreate />
      </Route>
      <Route path={APP_PATHS.PLANTING_SITES_DRAFT_EDIT}>
        <PlantingSiteDraftEdit />
      </Route>
      <Route path={APP_PATHS.PLANTING_SITES_DRAFT_VIEW}>
        <PlantingSiteDraftView />
      </Route>
    </Switch>
  );
}
