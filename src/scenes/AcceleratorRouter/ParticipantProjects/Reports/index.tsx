import React from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router';

import { APP_PATHS } from 'src/constants';

import EditSettings from './EditSettings';
import NewProjectSpecificMetric from './NewProjectSpecificMetric';
import NewStandardMetric from './NewStandardMetric';
import ReportView from './ReportView';
import ReportsView from './ReportsView';

const ReportsRouter = () => {
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  return (
    <Routes>
      <Route path='' element={<ReportsView />} />
      <Route path='/:reportId' element={<ReportView />} />
      <Route path='/edit' element={<EditSettings />} />
      <Route path='/metrics/new' element={<NewProjectSpecificMetric />} />
      <Route path='/standard-metrics/new' element={<NewStandardMetric />} />
      <Route
        path='*'
        element={<Navigate to={APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', `${projectId}`)} />}
      />
    </Routes>
  );
};

export default ReportsRouter;
