import React from 'react';
import { Route, Routes } from 'react-router';

import PlantingSeasonDetailsView from './PlantingSeasonDetailsView';
import PlantingSeasonsView from './PlantingSeasonsView';

const PlantingSeasonsRouter = () => {
  return (
    <Routes>
      <Route path='' element={<PlantingSeasonsView />} />
      <Route path=':plantingSeasonId' element={<PlantingSeasonDetailsView />} />
    </Routes>
  );
};

export default PlantingSeasonsRouter;
