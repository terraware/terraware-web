import React from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router';

import { APP_PATHS } from 'src/constants';

import VotingEdit from './VotingEdit';
import VotingView from './VotingView';

const VotingRouter = () => {
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  return (
    <Routes>
      <Route path='' element={<VotingView />} />
      <Route path='edit' element={<VotingEdit />} />
      <Route
        path='*'
        element={<Navigate to={APP_PATHS.ACCELERATOR_PROJECT_VOTES.replace(':projectId', `${projectId}`)} />}
      />
    </Routes>
  );
};

export default VotingRouter;
