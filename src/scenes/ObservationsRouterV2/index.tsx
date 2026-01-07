import React from 'react';
import { Route, Routes } from 'react-router';

import ObservationListView from './ListView';
import ObservationSingleView from './SingleView';

const ObservationsRouterV2 = (): JSX.Element => {
  return (
    <Routes>
      <Route path={'/:observationId/*'} element={<ObservationSingleView />} />
      <Route path={'/*'} element={<ObservationListView />} />
    </Routes>
  );
};

export default ObservationsRouterV2;
