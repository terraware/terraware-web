import React, { type JSX } from 'react';
import { Route, Routes } from 'react-router';

import SurvivalRateSettings from '../SurvivalRateSettings';
import EditSurvivalRateSettings from '../SurvivalRateSettings/EditSurvivalRateSettings';
import ObservationListView from './ListView';
import ObservationScheduleRouter from './Schedule';
import ObservationSingleView from './SingleView';

const ObservationsRouterV2 = (): JSX.Element => {
  return (
    <Routes>
      <Route path={'/:observationId/*'} element={<ObservationSingleView />} />
      <Route path={'/schedule/*'} element={<ObservationScheduleRouter />} />
      <Route path={'/survival-rate-settings/:plantingSiteId'} element={<SurvivalRateSettings />} />
      <Route path={'/survival-rate-settings/:plantingSiteId/edit'} element={<EditSurvivalRateSettings />} />
      <Route path={'/*'} element={<ObservationListView />} />
    </Routes>
  );
};

export default ObservationsRouterV2;
