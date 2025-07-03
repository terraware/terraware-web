import React from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import DocumentProducerProvider from 'src/providers/DocumentProducer/Provider';
import ProjectProvider from 'src/providers/Project/ProjectProvider';

import ProjectProfileEdit from './EditView/ProjectProfileEdit';
import ParticipantProjectProvider from './ParticipantProjectProvider';
import ProjectPage from './ProjectPage';
import ProjectProfileGisMaps from './ProjectProfileGisMaps';
import Reports from './Reports';
import Scoring from './Scoring';
import Voting from './Voting';
import VotingProvider from './Voting/VotingProvider';

const ParticipantProjectsRouter = () => {
  const isGisMapsEnabled = isEnabled('GIS Maps');
  return (
    <ProjectProvider>
      <VotingProvider>
        <ParticipantProjectProvider>
          <DocumentProducerProvider>
            <Routes>
              <Route path={'edit'} element={<ProjectProfileEdit />} />
              <Route path={''} element={<ProjectPage />} />
              {isGisMapsEnabled && <Route path={'maps/*'} element={<ProjectProfileGisMaps />} />}
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
