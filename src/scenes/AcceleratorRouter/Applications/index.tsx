import { useEffect } from 'react';
import React, { Navigate, Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import useNavigateTo from 'src/hooks/useNavigateTo';
import ApplicationProvider from 'src/providers/Application';

import ApplicationMapUpload from './ApplicaitonMapUpload';
import ApplicationMap from './ApplicationMap';
import ApplicationView from './ApplicationView';
import ApplicationsListView from './ApplicationsList';

const ApplicationsRouter = () => {
  const isApplicationEnabled = isEnabled('Accelerator Application');
  const { goToAccelerator } = useNavigateTo();

  useEffect(() => {
    if (!isApplicationEnabled) {
      goToAccelerator();
    }
  }, [isApplicationEnabled, goToAccelerator]);

  return (
    <ApplicationProvider>
      <Routes>
        <Route path={''} element={<ApplicationsListView />} />
        <Route path={':applicationId'} element={<ApplicationView />} />
        <Route path={':applicationId/map'} element={<ApplicationMap />} />
        <Route path={':applicationId/map/upload'} element={<ApplicationMapUpload />} />
        <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_APPLICATIONS} />} />
      </Routes>
    </ApplicationProvider>
  );
};

export default ApplicationsRouter;
