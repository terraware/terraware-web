import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Species from '../Species';
import SpeciesEditView from '../Species/SpeciesEditView';

const SpeciesDeliverableRouter = () => {
  return (
    <Routes>
      <Route path={''} element={<Species />} />
      <Route path={'/edit'} element={<SpeciesEditView />} />
    </Routes>
  );
};

export default SpeciesDeliverableRouter;
