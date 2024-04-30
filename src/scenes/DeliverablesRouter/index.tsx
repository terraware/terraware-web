import React from 'react';
import { Route, Routes } from 'react-router-dom';

import ProjectProvider from 'src/providers/Project/ProjectProvider';
import ParticipantProjectProvider from 'src/scenes/AcceleratorRouter/ParticipantProjects/ParticipantProjectProvider';

import DeliverableViewWrapper from './DeliverableViewWrapper';
import DeliverablesList from './DeliverablesList';

const DeliverablesRouter = (): JSX.Element => {
  return (
    <Routes>
      <Route
        path={'/:deliverableId/submissions/:projectId'}
        element={
          <ProjectProvider>
            <ParticipantProjectProvider>
              <DeliverableViewWrapper />
            </ParticipantProjectProvider>
          </ProjectProvider>
        }
      />
      <Route path={'*'} element={<DeliverablesList />} />
    </Routes>
  );
};

export default DeliverablesRouter;
