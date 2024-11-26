import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';

import { CircularProgress } from '@mui/material';

import { useOrganization } from 'src/providers';
import { requestPlantingSiteObservationsResults } from 'src/redux/features/observations/observationsThunks';
import {
  selectPlantingSiteObservationsResults,
  selectPlantingSiteObservationsResultsError,
} from 'src/redux/features/observations/plantingSiteDetailsSelectors';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
import { selectPlantingSites, selectPlantingSitesError } from 'src/redux/features/tracking/trackingSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';

import PlantingSiteCreate from './edit/PlantingSiteCreate';
import PlantingSiteDraftCreate from './edit/PlantingSiteDraftCreate';
import PlantingSiteDraftEdit from './edit/PlantingSiteDraftEdit';
import PlantingSiteDraftView from './view/PlantingSiteDraftView';
import PlantingSiteDraftZoneView from './view/PlantingSiteDraftZoneView';
import PlantingSiteSubzoneView from './view/PlantingSiteSubzoneView';
import PlantingSiteView from './view/PlantingSiteView';
import PlantingSiteZoneView from './view/PlantingSiteZoneView';
import PlantingSitesList from './view/PlantingSitesList';

/**
 * This page will route to the correct component based on url params
 */
export type PlantingSitesProps = {
  reloadTracking: () => void;
};

export default function PlantingSites({ reloadTracking }: PlantingSitesProps): JSX.Element {
  return (
    <Routes>
      <Route path={'/new'} element={<PlantingSiteCreate reloadPlantingSites={reloadTracking} />} />
      <Route path={'/draft/*'} element={<PlantingSitesDraftRouter />} />
      <Route path={'/:plantingSiteId/*'} element={<PlantingSitesRouter reloadTracking={reloadTracking} />} />
      <Route path={'*'} element={<PlantingSitesList />} />
    </Routes>
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
    if (!isNaN(siteId) && selectedOrganization.id !== -1) {
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
    <Routes>
      <Route path={'/zone/:zoneId/subzone/:subzoneId'} element={<PlantingSiteSubzoneView />} />
      <Route path={'/zone/:zoneId'} element={<PlantingSiteZoneView />} />
      <Route path={'/edit'} element={<PlantingSiteCreate reloadPlantingSites={reloadTracking} />} />
      <Route path={'*'} element={<PlantingSiteView />} />
    </Routes>
  );
}

export function PlantingSitesDraftRouter(): JSX.Element {
  return (
    <Routes>
      <Route path={'/:plantingSiteId/zone/:zoneId'} element={<PlantingSiteDraftZoneView />} />
      <Route path={'/new'} element={<PlantingSiteDraftCreate />} />
      <Route path={'/:plantingSiteId/edit'} element={<PlantingSiteDraftEdit />} />
      <Route path={'/:plantingSiteId'} element={<PlantingSiteDraftView />} />
      <Route path={'*'} element={<PlantingSiteDraftView />} />
    </Routes>
  );
}
