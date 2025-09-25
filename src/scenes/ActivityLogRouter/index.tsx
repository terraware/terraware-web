import React from 'react';
import { Route, Routes } from 'react-router';

import ActivityCreateView from 'src/components/ActivityLog/ActivityCreateView';
import ActivityEditView from 'src/components/ActivityLog/ActivityEditView';
import isEnabled from 'src/features';
import { useOrganization, useUser } from 'src/providers';

import ActivityLogView from './ActivityLogView';

const ActivityLogRouter = () => {
  const { isAllowed } = useUser();
  const { selectedOrganization: organization } = useOrganization();
  const isActivityLogEnabled = isEnabled('Activity Log');

  return (
    <Routes>
      {/* @see /src/constants.ts:APP_PATHS.ACTIVITY_LOG */}
      {isActivityLogEnabled && isAllowed('READ_ACTIVITIES', { organization }) && (
        <Route path='' element={<ActivityLogView />} />
      )}

      {/* @see /src/constants.ts:APP_PATHS.ACTIVITY_LOG_EDIT */}
      {isActivityLogEnabled && isAllowed('EDIT_ACTIVITIES', { organization }) && (
        <Route path='/:projectId/:activityId/edit' element={<ActivityEditView />} />
      )}

      {/* @see /src/constants.ts:APP_PATHS.ACTIVITY_LOG_NEW */}
      {isActivityLogEnabled && isAllowed('CREATE_ACTIVITIES', { organization }) && (
        <Route path='/:projectId/new' element={<ActivityCreateView />} />
      )}
    </Routes>
  );
};

export default ActivityLogRouter;
