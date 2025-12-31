import React from 'react';
import { Route, Routes, useParams } from 'react-router';

import PlantingSiteCreate from './edit/PlantingSiteCreate';
import PlantingSiteDraftCreate from './edit/PlantingSiteDraftCreate';
import PlantingSiteDraftEdit from './edit/PlantingSiteDraftEdit';
import PlantingSiteDraftStratumView from './view/PlantingSiteDraftStratumView';
import PlantingSiteDraftView from './view/PlantingSiteDraftView';
import PlantingSiteStratumView from './view/PlantingSiteStratumView';
import PlantingSiteView from './view/PlantingSiteView';
import PlantingSitesList from './view/PlantingSitesList';

/**
 * This page will route to the correct component based on url params
 */
export default function PlantingSites(): JSX.Element {
  return (
    <Routes>
      <Route path={'/new'} element={<PlantingSiteCreate />} />
      <Route path={'/draft/*'} element={<PlantingSitesDraftRouter />} />
      <Route path={'/:plantingSiteId/*'} element={<PlantingSitesRouter />} />
      <Route path={'*'} element={<PlantingSitesList />} />
    </Routes>
  );
}

export function PlantingSitesRouter(): JSX.Element {
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();

  return (
    <Routes>
      <Route path={'/zone/:zoneId'} element={<PlantingSiteStratumView />} />
      <Route path={'/edit'} element={<PlantingSiteCreate plantingSiteId={Number(plantingSiteId)} />} />
      <Route path={'*'} element={<PlantingSiteView />} />
    </Routes>
  );
}

export function PlantingSitesDraftRouter(): JSX.Element {
  return (
    <Routes>
      <Route path={'/:plantingSiteId/zone/:zoneId'} element={<PlantingSiteDraftStratumView />} />
      <Route path={'/new'} element={<PlantingSiteDraftCreate />} />
      <Route path={'/:plantingSiteId/edit'} element={<PlantingSiteDraftEdit />} />
      <Route path={'/:plantingSiteId'} element={<PlantingSiteDraftView />} />
      <Route path={'*'} element={<PlantingSiteDraftView />} />
    </Routes>
  );
}
