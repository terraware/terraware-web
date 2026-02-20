import React, { type JSX } from 'react';
import { Route, Routes } from 'react-router';

import RescheduleView from './Reschedule';
import ScheduleView from './Schedule';

const ObservationScheduleRouter = (): JSX.Element => {
  return (
    <Routes>
      <Route path={'/:observationId'} element={<RescheduleView />} />
      <Route path={'/*'} element={<ScheduleView />} />
    </Routes>
  );
};

export default ObservationScheduleRouter;
