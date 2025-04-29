import React from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router';

import { APP_PATHS } from 'src/constants';

import EditView from './EditView';
import ScoresView from './ScoreView';

const ScoringRouter = () => {
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  return (
    <Routes>
      <Route path='' element={<ScoresView />} />
      <Route path='edit' element={<EditView />} />
      <Route
        path='*'
        element={<Navigate to={APP_PATHS.ACCELERATOR_PROJECT_SCORES.replace(':projectId', `${projectId}`)} />}
      />
    </Routes>
  );
};

export default ScoringRouter;
