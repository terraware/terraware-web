import React, { Navigate, Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import ProjectProvider from 'src/providers/Project/ProjectProvider';

import ScoringProvider from '../Scoring/ScoringProvider';
import VotingProvider from '../Voting/VotingProvider';
import EditView from './EditView';
import ParticipantProjectProvider from './ParticipantProjectProvider';
import SingleView from './SingleView';

const ParticipantProjectsRouter = () => {
  return (
    <ProjectProvider>
      <VotingProvider>
        <ScoringProvider>
          <ParticipantProjectProvider>
            <Routes>
              <Route path={APP_PATHS.ACCELERATOR_PROJECT_VIEW} element={<SingleView />} />
              <Route path={APP_PATHS.ACCELERATOR_PROJECT_EDIT} element={<EditView />} />
              <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_OVERVIEW} />} />
            </Routes>
          </ParticipantProjectProvider>
        </ScoringProvider>
      </VotingProvider>
    </ProjectProvider>
  );
};

export default ParticipantProjectsRouter;
