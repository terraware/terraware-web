import React from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { APP_PATHS } from 'src/constants';

import ApplicationDeliverable from './ApplicationDeliverable';
import ApplicationListView from './ApplicationListView';
import ApplicationMap from './ApplicationMap';
import ApplicationView from './ApplicationView';

const ApplicationsRouter = () => {
  return (
    <Routes>
      <Route path={''} element={<ApplicationListView />} />
      <Route path={':applicationId'} element={<ApplicationView />} />
      <Route path={':applicationId/deliverable/:deliverableId'} element={<ApplicationDeliverable />} />
      <Route path={':applicationId/map'} element={<ApplicationMap />} />
      <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_APPLICATIONS} />} />
    </Routes>
  );
};

export default ApplicationsRouter;
