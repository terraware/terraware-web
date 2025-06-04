import React from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { APP_PATHS } from 'src/constants';
import DocumentProducerProvider from 'src/providers/DocumentProducer/Provider';
import ProjectProvider from 'src/providers/Project/ProjectProvider';

import ProjectProfileEdit from './EditView/ProjectProfileEdit';
import ParticipantProjectProvider from './ParticipantProjectProvider';
import ProjectPage from './ProjectPage';
import Reports from './Reports';
import Scoring from './Scoring';
import Voting from './Voting';
import VotingProvider from './Voting/VotingProvider';

const ParticipantProjectsRouter = () => {
  return (
    <ProjectProvider>
      <VotingProvider>
        <ParticipantProjectProvider>
          <DocumentProducerProvider>
            <Routes>
              <Route path={'edit'} element={<ProjectProfileEdit />} />
              <Route path={''} element={<ProjectPage />} />
              <Route path={'votes/*'} element={<Voting />} />
              <Route path={'scores/*'} element={<Scoring />} />
              <Route path={'reports/*'} element={<Reports />} />
              <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_OVERVIEW} />} />
            </Routes>
          </DocumentProducerProvider>
        </ParticipantProjectProvider>
      </VotingProvider>
    </ProjectProvider>
  );
};

export default ParticipantProjectsRouter;
