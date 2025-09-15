import React from 'react';
import { Route, Routes } from 'react-router';

import ActivityCreateView from 'src/components/ActivityLog/ActivityCreateView';
import isEnabled from 'src/features';

import ActivityLogView from './ActivityLogView';

const ActivityLogRouter = () => {
  const isActivityLogEnabled = isEnabled('Activity Log');

  return (
    <Routes>
      {/* @see /src/constants.ts:APP_PATHS.ACTIVITY_LOG */}
      {isActivityLogEnabled && <Route path='' element={<ActivityLogView />} />}

      {/* @see /src/constants.ts:APP_PATHS.ACTIVITY_LOG_NEW */}
      {isActivityLogEnabled && <Route path='/:projectId/new' element={<ActivityCreateView />} />}
    </Routes>
  );
};

export default ActivityLogRouter;
