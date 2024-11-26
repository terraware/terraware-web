import React from 'react';
import { Route, Routes } from 'react-router-dom';

import ApplicationsList from './ApplicationsList';
import OverviewView from './portal/Overview';

const ApplicationsRouter = () => {
  return (
    <Routes>
      {/* @see /src/constants.ts:APP_PATHS.APPLICATION */}
      <Route path={'/:applicationId'} element={<OverviewView />} />
      <Route path={''} element={<ApplicationsList />} />
    </Routes>
  );
};

export default ApplicationsRouter;
