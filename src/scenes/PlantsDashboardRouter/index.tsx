import React from 'react';
import { Route, Routes } from 'react-router-dom';

import PlantsDashboardView from 'src/scenes/PlantsDashboardRouter/PlantsDashboardView';

const PlantsDashboardRouter = () => {
  return (
    <Routes>
      <Route path='/*' element={<PlantsDashboardView />} />
      <Route path={'/:plantingSiteId'} element={<PlantsDashboardView />} />
    </Routes>
  );
};

export default PlantsDashboardRouter;
