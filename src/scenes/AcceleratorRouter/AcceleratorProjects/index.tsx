import React from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { APP_PATHS } from 'src/constants';
import DocumentProducerProvider from 'src/providers/DocumentProducer/Provider';
import ProjectProvider from 'src/providers/Project/ProjectProvider';

import AcceleratorProjectProvider from './AcceleratorProjectProvider';
import ProjectProfileEdit from './EditView/ProjectProfileEdit';
import ProjectModulesEditView from './Modules/ProjectModulesEditView';
import ProjectPage from './ProjectPage';
import ProjectProfileGisMaps from './ProjectProfileGisMaps';
import Reports from './Reports';
import Scoring from './Scoring';
import Voting from './Voting';
import VotingProvider from './Voting/VotingProvider';

const AcceleratorProjectsRouter = () => {
  return (
    <ProjectProvider>
      <VotingProvider>
        <AcceleratorProjectProvider>
          <DocumentProducerProvider>
            <Routes>
              <Route path={'edit'} element={<ProjectProfileEdit />} />
              <Route path={'modules/edit'} element={<ProjectModulesEditView />} />
              <Route path={''} element={<ProjectPage />} />
              <Route path={'maps/*'} element={<ProjectProfileGisMaps />} />
              <Route path={'votes/*'} element={<Voting />} />
              <Route path={'scores/*'} element={<Scoring />} />
              <Route path={'reports/*'} element={<Reports />} />
              <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_PROJECTS} />} />
            </Routes>
          </DocumentProducerProvider>
        </AcceleratorProjectProvider>
      </VotingProvider>
    </ProjectProvider>
  );
};

export default AcceleratorProjectsRouter;
