import React, { type JSX } from 'react';
import { Route, Routes } from 'react-router';

import InventoryPlanningView from './InventoryPlanningView';

const InventoryPlanningRouter = (): JSX.Element => (
  <Routes>
    <Route path='/' element={<InventoryPlanningView />} />
  </Routes>
);

export default InventoryPlanningRouter;
