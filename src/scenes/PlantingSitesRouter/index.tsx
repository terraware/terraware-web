import React, { type JSX } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { BusySpinner } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import { isAdmin } from 'src/utils/organization';

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
  const { selectedOrganization } = useOrganization();

  if (!selectedOrganization) {
    return <BusySpinner withSkrim={true} />;
  }

  if (!isAdmin(selectedOrganization)) {
    return <Navigate to={APP_PATHS.PLANTING_SITES} replace />;
  }

  return (
    <Routes>
      <Route path={'/:plantingSiteId/edit'} element={<PlantingSiteDraftEdit />} />
      <Route path={'/:plantingSiteId'} element={<PlantingSiteDraftView />} />
      <Route path={'*'} element={<PlantingSiteDraftView />} />
    </Routes>
  );
}
