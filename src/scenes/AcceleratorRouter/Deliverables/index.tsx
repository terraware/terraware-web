import React, { Navigate, Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import DeliverableProvider from 'src/providers/Deliverable/DeliverableProvider';
import ParticipantProvider from 'src/providers/Participant/ParticipantProvider';
import ProjectProvider from 'src/providers/Project/ProjectProvider';

import ParticipantProjectProvider from '../ParticipantProjects/ParticipantProjectProvider';
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
              <ParticipantProjectProvider>
                <DeliverableProvider>
                  <DeliverableRouter />
                </DeliverableProvider>
              </ParticipantProjectProvider>
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
