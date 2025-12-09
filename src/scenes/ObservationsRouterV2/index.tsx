import React from 'react';
import { Route, Routes } from 'react-router';

import ObservationListView from './ListView';

const ObservationsRouter = (): JSX.Element => {
  return (
    <Routes>
      <Route path={'/*'} element={<ObservationListView />} />
    </Routes>
  );
};

export default ObservationsRouter;
