import React, { Navigate, Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import ProjectProvider from 'src/providers/Project/ProjectProvider';

import VotingEdit from './VotingEdit';
import VotingProvider from './VotingProvider';
import VotingView from './VotingView';

const VotingRouter = () => {
  return (
    <ProjectProvider>
      <VotingProvider>
        <Routes>
          <Route path={APP_PATHS.ACCELERATOR_VOTING} element={<VotingView />} />
          <Route path={APP_PATHS.ACCELERATOR_VOTING_EDIT} element={<VotingEdit />} />
          <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_VOTING} />} />
        </Routes>
      </VotingProvider>
    </ProjectProvider>
  );
};

export default VotingRouter;
