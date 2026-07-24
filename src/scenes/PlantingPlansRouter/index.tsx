import React from 'react';
import { Route, Routes } from 'react-router';

import PlantingPlanDetailsView from './PlantingPlanDetailsView';
import PlantingPlansView from './PlantingPlansView';

const PlantingPlansRouter = () => {
  return (
    <Routes>
      <Route path='' element={<PlantingPlansView />} />
      <Route path=':plantingSiteId' element={<PlantingPlanDetailsView />} />
    </Routes>
  );
};

export default PlantingPlansRouter;
