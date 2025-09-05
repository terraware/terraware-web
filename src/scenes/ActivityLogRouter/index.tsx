import React from 'react';
import { Route, Routes } from 'react-router';

import isEnabled from 'src/features';

import ActivityLogView from './ActivityLogView';

const ActivityLogRouter = () => {
  const isActivityLogEnabled = isEnabled('Activity Log');

  return (
    <Routes>
      {/* @see /src/constants.ts:APP_PATHS.ACTIVITY_LOG */}
      {isActivityLogEnabled && <Route path='' element={<ActivityLogView />} />}
    </Routes>
  );
};

export default ActivityLogRouter;
