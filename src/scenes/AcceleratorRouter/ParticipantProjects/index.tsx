import React from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import ProjectProvider from 'src/providers/Project/ProjectProvider';

import EditView from './EditView';
import ProjectProfileEdit from './EditView/ProjectProfileEdit';
import ParticipantProjectProvider from './ParticipantProjectProvider';
import ProjectPage from './ProjectPage';
import Reports from './Reports';
import Scoring from './Scoring';
import SingleView from './SingleView';
import Voting from './Voting';
import VotingProvider from './Voting/VotingProvider';

const ParticipantProjectsRouter = () => {
  return (
    <ProjectProvider>
      <VotingProvider>
        <ParticipantProjectProvider>
          <Routes>
            <Route path={'edit'} element={isEnabled('New Project Profile') ? <ProjectProfileEdit /> : <EditView />} />
            <Route path={''} element={isEnabled('New Project Profile') ? <ProjectPage /> : <SingleView />} />
            <Route path={'votes/*'} element={<Voting />} />
            <Route path={'scores/*'} element={<Scoring />} />
            <Route path={'reports/*'} element={<Reports />} />
            <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_OVERVIEW} />} />
          </Routes>
        </ParticipantProjectProvider>
      </VotingProvider>
    </ProjectProvider>
  );
};

export default ParticipantProjectsRouter;
