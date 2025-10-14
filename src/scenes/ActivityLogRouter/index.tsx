import React, { useMemo } from 'react';
import { Route, Routes } from 'react-router';

import ActivityCreateView from 'src/components/ActivityLog/ActivityCreateView';
import ActivityEditView from 'src/components/ActivityLog/ActivityEditView';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useOrganization, useUser } from 'src/providers';

import ActivityLogView from './ActivityLogView';

const ActivityLogRouter = () => {
  const { isAllowed } = useUser();
  const { selectedOrganization } = useOrganization();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const organization = useMemo(
    () => (isAcceleratorRoute ? undefined : selectedOrganization),
    [isAcceleratorRoute, selectedOrganization]
  );

  return (
    <Routes>
      {/* @see /src/constants.ts:APP_PATHS.ACTIVITY_LOG */}
      {isAllowed('READ_ACTIVITIES', { organization }) && <Route path='' element={<ActivityLogView />} />}

      {/* @see /src/constants.ts:APP_PATHS.ACTIVITY_LOG_EDIT */}
      {isAllowed('EDIT_ACTIVITIES', { organization }) && (
        <Route path='/:projectId/:activityId/edit' element={<ActivityEditView />} />
      )}

      {/* @see /src/constants.ts:APP_PATHS.ACTIVITY_LOG_NEW */}
      {isAllowed('CREATE_ACTIVITIES', { organization }) && (
        <Route path='/:projectId/new' element={<ActivityCreateView />} />
      )}
    </Routes>
  );
};

export default ActivityLogRouter;
