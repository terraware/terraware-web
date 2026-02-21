import React, { type JSX } from 'react';
import { Route, Routes } from 'react-router';

import AbandonObservationModalProvider from './Abandon';
import ObservationListView from './ListView';
import ReassignPlotModalProvider from './Reassign';
import ObservationScheduleRouter from './Schedule';
import ObservationSingleView from './SingleView';

const ObservationsRouterV2 = (): JSX.Element => {
  return (
    <AbandonObservationModalProvider>
      <ReassignPlotModalProvider>
        <Routes>
          <Route path={'/:observationId/*'} element={<ObservationSingleView />} />
          <Route path={'/schedule/*'} element={<ObservationScheduleRouter />} />
          <Route path={'/*'} element={<ObservationListView />} />
        </Routes>
      </ReassignPlotModalProvider>
    </AbandonObservationModalProvider>
  );
};

export default ObservationsRouterV2;
