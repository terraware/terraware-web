import React from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router';

import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import { useUser } from 'src/providers';

import EditSettings from './EditSettings';
import FunderReportPreviewV2 from './FunderReportPreviewV2';
import NewIndicator from './NewIndicator';
import PublishedFunderReportV2 from './PublishedFunderReportV2';
import ReportEditV2 from './ReportEditV2';
import ReportView from './ReportView';
import ReportsView from './ReportsView';

const ReportsRouter = () => {
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const { isAllowed } = useUser();

  const newReportViewEnabled = isEnabled('Report Updates July 2026');

  if (newReportViewEnabled) {
    return (
      <Routes>
        <Route path='/edit' element={<EditSettings />} />
        <Route path='/indicators/new' element={<NewIndicator />} />
        <Route path='/indicators' element={<ReportsView tab='settings' />} />
        <Route path='/targets' element={<ReportsView tab='targets' />} />
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
        <Route path='/:reportId' element={<ReportsView tab='reports' />} />
        <Route path='' element={<ReportsView tab='reports' />} />
        <Route
          path='*'
          element={<Navigate to={APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', `${projectId}`)} />}
        />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path='' element={<ReportsView />} />
      <Route path='/:reportId' element={<ReportView />} />
      <Route path='/edit' element={<EditSettings />} />
      <Route path='/indicators/new' element={<NewIndicator />} />
      <Route
        path='*'
        element={<Navigate to={APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', `${projectId}`)} />}
      />
    </Routes>
  );
};

export default ReportsRouter;
