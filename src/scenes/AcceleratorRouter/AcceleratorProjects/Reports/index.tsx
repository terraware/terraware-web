import React from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router';

import { APP_PATHS } from 'src/constants';
import { useUser } from 'src/providers';

import EditSettings from './EditSettings';
import FunderReportPreviewV2 from './FunderReportPreviewV2';
import NewIndicator from './NewIndicator';
import PublishedFunderReportV2 from './PublishedFunderReportV2';
import ReportEditV2 from './ReportEditV2';
import ReportsSegmentedView from './ReportsSegmentedView';

const ReportsRouter = () => {
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const { isAllowed } = useUser();

  return (
    <Routes>
      <Route path='/edit' element={<EditSettings />} />
      <Route path='/indicators/new' element={<NewIndicator />} />
      <Route path='/indicators' element={<ReportsSegmentedView tab='settings' />} />
      <Route path='/targets' element={<ReportsSegmentedView tab='targets' />} />
      <Route
        path='/:reportId/edit'
        element={
          isAllowed('EDIT_REPORTS') ? (
            <ReportEditV2 />
          ) : (
            <Navigate to={APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', `${projectId}`)} />
          )
        }
      />
      <Route path='/:reportId/preview' element={<FunderReportPreviewV2 />} />
      <Route path='/:reportId/published' element={<PublishedFunderReportV2 />} />
      <Route path='/:reportId' element={<ReportsSegmentedView tab='reports' />} />
      <Route path='' element={<ReportsSegmentedView tab='reports' />} />
      <Route
        path='*'
        element={<Navigate to={APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', `${projectId}`)} />}
      />
    </Routes>
  );
};

export default ReportsRouter;
