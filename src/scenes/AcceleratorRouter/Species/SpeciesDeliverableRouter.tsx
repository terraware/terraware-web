import React from 'react';
import { Route, Routes } from 'react-router-dom';

import ParticipantProjectSpeciesProvider from 'src/providers/ParticipantProject/ParticipantProjectSpeciesProvider';

import Species from '.';
import SpeciesEditView from './SpeciesEditView';

const SpeciesDeliverableRouter = () => {
  return (
    <ParticipantProjectSpeciesProvider>
      <Routes>
        <Route path={''} element={<Species />} />
        <Route path={'/edit'} element={<SpeciesEditView />} />
      </Routes>
    </ParticipantProjectSpeciesProvider>
  );
};

export default SpeciesDeliverableRouter;
