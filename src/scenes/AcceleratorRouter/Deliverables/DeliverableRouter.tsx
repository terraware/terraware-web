import React from 'react';
import { Route, Routes } from 'react-router-dom';

import DeliverableViewWrapper from './DeliverableViewWrapper';
import SpeciesDeliverableRouter from './SpeciesDeliverableRouter';

const DeliverableRouter = () => {
  return (
    <Routes>
      <Route path={''} element={<DeliverableViewWrapper />} />
      <Route path={'/species/:participantProjectSpeciesId/*'} element={<SpeciesDeliverableRouter />} />
    </Routes>
  );
};

export default DeliverableRouter;
