import React from 'react';
import { Route, Routes } from 'react-router-dom';

import ParticipantProvider from 'src/providers/Participant/ParticipantProvider';
import ProjectProvider from 'src/providers/Project/ProjectProvider';

import ParticipantProjectProvider from '../AcceleratorRouter/ParticipantProjects/ParticipantProjectProvider';
import DeliverableViewWrapper from './DeliverableViewWrapper';
import DeliverablesList from './DeliverablesList';

const DeliverablesRouter = (): JSX.Element => {
  return (
    <Routes>
      <Route
        path={'/:deliverableId/submissions/:projectId'}
        element={
          <ProjectProvider>
            <ParticipantProvider>
              <ParticipantProjectProvider>
                <DeliverableViewWrapper />
              </ParticipantProjectProvider>
            </ParticipantProvider>
          </ProjectProvider>
        }
      />
      <Route path={'*'} element={<DeliverablesList />} />
    </Routes>
  );
};

export default DeliverablesRouter;
