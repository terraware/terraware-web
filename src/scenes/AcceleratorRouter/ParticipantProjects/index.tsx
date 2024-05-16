import React, { Navigate, Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import ProjectProvider from 'src/providers/Project/ProjectProvider';

import EditView from './EditView';
import ParticipantProjectProvider from './ParticipantProjectProvider';
import Scoring from './Scoring';
import ScoringProvider from './Scoring/ScoringProvider';
import SingleView from './SingleView';
import Voting from './Voting';
import VotingProvider from './Voting/VotingProvider';

const ParticipantProjectsRouter = () => {
  return (
    <ProjectProvider>
      <VotingProvider>
        <ScoringProvider>
          <ParticipantProjectProvider>
            <Routes>
              <Route path={'edit'} element={<EditView />} />
              <Route path={''} element={<SingleView />} />
              <Route path={'votes/*'} element={<Voting />} />
              <Route path={'scores/*'} element={<Scoring />} />
              <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_OVERVIEW} />} />
            </Routes>
          </ParticipantProjectProvider>
        </ScoringProvider>
      </VotingProvider>
    </ProjectProvider>
  );
};

export default ParticipantProjectsRouter;
