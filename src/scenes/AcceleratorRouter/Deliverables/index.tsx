import React from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { APP_PATHS } from 'src/constants';
import DeliverableProvider from 'src/providers/Deliverable/DeliverableProvider';
import ParticipantProvider from 'src/providers/Participant/ParticipantProvider';
import ProjectProvider from 'src/providers/Project/ProjectProvider';

import AcceleratorProjectProvider from '../AcceleratorProjects/AcceleratorProjectProvider';
import DeliverableRouter from './DeliverableRouter';
import DeliverablesList from './DeliverablesList';

const DeliverablesRouter = () => {
  return (
    <Routes>
      <Route
        path={'/:deliverableId/submissions/:projectId/*'}
        element={
          <ProjectProvider>
            <ParticipantProvider>
              <AcceleratorProjectProvider>
                <DeliverableProvider>
                  <DeliverableRouter />
                </DeliverableProvider>
              </AcceleratorProjectProvider>
            </ParticipantProvider>
          </ProjectProvider>
        }
      />
      <Route path={''} element={<DeliverablesList />} />
      <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_DELIVERABLES} />} />
    </Routes>
  );
};

export default DeliverablesRouter;
