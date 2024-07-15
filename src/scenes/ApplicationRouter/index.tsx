import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import isEnabled from 'src/features';
import useNavigateTo from 'src/hooks/useNavigateTo';

import ApplicationsList from './ApplicationsList';
import OverviewView from './portal/Overview';

const ApplicationsRouter = () => {
  const applicationEnabled = isEnabled('Accelerator Application');
  const { goToHome } = useNavigateTo();

  useEffect(() => {
    if (!applicationEnabled) {
      goToHome();
    }
  }, [applicationEnabled, goToHome]);

  return (
    <Routes>
      {/* @see /src/constants.ts:APP_PATHS.APPLICATION */}
      <Route path={'/:applicationId'} element={<OverviewView />} />
      <Route path={''} element={<ApplicationsList />} />
    </Routes>
  );
};

export default ApplicationsRouter;
