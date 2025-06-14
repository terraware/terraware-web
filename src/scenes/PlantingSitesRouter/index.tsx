import React, { useEffect } from 'react';
import { Route, Routes, useParams } from 'react-router';

import { CircularProgress } from '@mui/material';

import { useOrganization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
import { useAppDispatch } from 'src/redux/store';

import PlantingSiteCreate from './edit/PlantingSiteCreate';
import PlantingSiteDraftCreate from './edit/PlantingSiteDraftCreate';
import PlantingSiteDraftEdit from './edit/PlantingSiteDraftEdit';
import PlantingSiteDraftView from './view/PlantingSiteDraftView';
import PlantingSiteDraftZoneView from './view/PlantingSiteDraftZoneView';
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

  const { allPlantingSites, setSelectedPlantingSite } = usePlantingSiteData();

  const dispatch = useAppDispatch();

  useEffect(() => {
    const siteId = Number(plantingSiteId);
    if (!isNaN(siteId)) {
      setSelectedPlantingSite(siteId);
    }
  }, [plantingSiteId, setSelectedPlantingSite]);

  useEffect(() => {
    if (selectedOrganization) {
      // This dispatch is required for a hasPlantings attribute for deleting a site
      // TODO: move plantings into usePlantingSite hook
      void dispatch(requestPlantings(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization]);

  // show spinner while initializing data
  if (allPlantingSites === undefined) {
    return <CircularProgress sx={{ margin: 'auto' }} />;
  }

  return (
    <Routes>
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
