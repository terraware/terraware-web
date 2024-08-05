import React from 'react';
import { Route, Routes } from 'react-router-dom';

import SpeciesDeliverableRouter from '../Species/SpeciesDeliverableRouter';
import DeliverableView from './DeliverableView';

const DeliverableRouter = () => {
  return (
    <Routes>
      <Route path={''} element={<DeliverableView />} />
      <Route path={'/species/:participantProjectSpeciesId/*'} element={<SpeciesDeliverableRouter />} />
    </Routes>
  );
};

export default DeliverableRouter;
