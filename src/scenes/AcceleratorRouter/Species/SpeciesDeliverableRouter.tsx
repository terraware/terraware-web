import React from 'react';
import { Route, Routes } from 'react-router';

import AcceleratorProjectSpeciesProvider from 'src/providers/AcceleratorProject/AcceleratorProjectSpeciesProvider';

import Species from '.';
import SpeciesEditView from './SpeciesEditView';

const SpeciesDeliverableRouter = () => {
  return (
    <AcceleratorProjectSpeciesProvider>
      <Routes>
        <Route path={''} element={<Species />} />
        <Route path={'/edit'} element={<SpeciesEditView />} />
      </Routes>
    </AcceleratorProjectSpeciesProvider>
  );
};

export default SpeciesDeliverableRouter;
