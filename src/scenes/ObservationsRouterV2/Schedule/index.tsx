import React, { type JSX } from 'react';
import { Route, Routes } from 'react-router';

import ScheduleView from './Schedule';

const ObservationScheduleRouter = (): JSX.Element => {
  return (
    <Routes>
      <Route path={'/*'} element={<ScheduleView />} />
    </Routes>
  );
};

export default ObservationScheduleRouter;
