import React, { Navigate, Route, Routes, useParams } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import ReportsView from './ReportsView';

const ReportsRouter = () => {
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  return (
    <Routes>
      <Route path='' element={<ReportsView />} />
      <Route
        path='*'
        element={<Navigate to={APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', `${projectId}`)} />}
      />
    </Routes>
  );
};

export default ReportsRouter;
