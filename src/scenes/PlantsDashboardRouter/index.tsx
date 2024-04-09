import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import PlantsDashboardView from 'src/scenes/PlantsDashboardRouter/PlantsDashboardView';

const PlantsDashboardRouter = () => {
  return (
    <Routes>
      <Route path={APP_PATHS.PLANTS_DASHBOARD} element={<PlantsDashboardView />} />
      <Route path={APP_PATHS.PLANTING_SITE_DASHBOARD} element={<PlantsDashboardView />} />
    </Routes>
  );
};

export default PlantsDashboardRouter;
