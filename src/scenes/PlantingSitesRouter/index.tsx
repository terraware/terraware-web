import React, { type JSX } from 'react';
import { Route, Routes } from 'react-router';

import PlantingSiteDraftCreate from './edit/PlantingSiteDraftCreate';
import PlantingSiteDraftEdit from './edit/PlantingSiteDraftEdit';
import PlantingSiteDraftView from './view/PlantingSiteDraftView';
import PlantingSiteView from './view/PlantingSiteView';
import PlantingSitesList from './view/PlantingSitesList';

/**
 * This page will route to the correct component based on url params
 */
export default function PlantingSites(): JSX.Element {
  return (
    <Routes>
      <Route path={'/draft/*'} element={<PlantingSitesDraftRouter />} />
      <Route path={'/:plantingSiteId/*'} element={<PlantingSiteView />} />
      <Route path={'*'} element={<PlantingSitesList />} />
    </Routes>
  );
}

function PlantingSitesDraftRouter(): JSX.Element {
  return (
    <Routes>
      <Route path={'/new'} element={<PlantingSiteDraftCreate />} />
      <Route path={'/:plantingSiteId/edit'} element={<PlantingSiteDraftEdit />} />
      <Route path={'/:plantingSiteId'} element={<PlantingSiteDraftView />} />
      <Route path={'*'} element={<PlantingSiteDraftView />} />
    </Routes>
  );
}
