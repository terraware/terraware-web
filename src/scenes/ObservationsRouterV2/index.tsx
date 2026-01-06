import React from 'react';
import { Route, Routes } from 'react-router';

import ObservationListView from './ListView';
import ObservatioSingleView from './SingleView';

const ObservationsRouterV2 = (): JSX.Element => {
  return (
    <Routes>
      <Route path={'/:observationId/*'} element={<ObservatioSingleView />} />
      <Route path={'/*'} element={<ObservationListView />} />
    </Routes>
  );
};

export default ObservationsRouterV2;
