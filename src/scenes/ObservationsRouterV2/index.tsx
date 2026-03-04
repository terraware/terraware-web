import React, { type JSX } from 'react';
import { Route, Routes } from 'react-router';

import ScrollToTop from 'src/components/common/ScrollToTop';

import SurvivalRateSettings from '../SurvivalRateSettings';
import EditSurvivalRateSettings from '../SurvivalRateSettings/EditSurvivalRateSettings';
import AbandonObservationModalProvider from './Abandon';
import ObservationListView from './ListView';
import ReassignPlotModalProvider from './Reassign';
import ObservationScheduleRouter from './Schedule';
import ObservationSingleView from './SingleView';

const ObservationsRouterV2 = (): JSX.Element => {
  return (
    <AbandonObservationModalProvider>
      <ReassignPlotModalProvider>
        <ScrollToTop />
        <Routes>
          <Route path={'/:observationId/*'} element={<ObservationSingleView />} />
          <Route path={'/schedule/*'} element={<ObservationScheduleRouter />} />
          <Route path={'/survival-rate-settings/:plantingSiteId'} element={<SurvivalRateSettings />} />
          <Route path={'/survival-rate-settings/:plantingSiteId/edit'} element={<EditSurvivalRateSettings />} />
          <Route path={'/*'} element={<ObservationListView />} />
        </Routes>
      </ReassignPlotModalProvider>
    </AbandonObservationModalProvider>
  );
};

export default ObservationsRouterV2;
