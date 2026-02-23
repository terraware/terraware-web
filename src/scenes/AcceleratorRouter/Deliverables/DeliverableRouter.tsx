import React from 'react';
import { Route, Routes } from 'react-router';

import SpeciesDeliverableRouter from '../Species/SpeciesDeliverableRouter';
import DeliverableView from './DeliverableView';

const DeliverableRouter = () => {
  return (
    <Routes>
      <Route path={''} element={<DeliverableView />} />
      <Route path={'/species/:acceleratorProjectSpeciesId/*'} element={<SpeciesDeliverableRouter />} />
    </Routes>
  );
};

export default DeliverableRouter;
