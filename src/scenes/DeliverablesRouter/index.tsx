import React from 'react';
import { Route, Routes } from 'react-router-dom';

import DeliverableProvider from 'src/providers/Deliverable/DeliverableProvider';
import ParticipantProvider from 'src/providers/Participant/ParticipantProvider';
import ProjectProvider from 'src/providers/Project/ProjectProvider';

import DeliverablesList from './DeliverablesList';
import QuestionsDeliverableEdit from './QuestionsDeliverableEditView';
import DeliverableView from './DeliverableView';

const DeliverablesRouter = (): JSX.Element => {
  return (
    <Routes>
      <Route
        path={'/:deliverableId/submissions/:projectId'}
        element={
          <ProjectProvider>
            <ParticipantProvider>
              <DeliverableProvider>
                <DeliverableView />
              </DeliverableProvider>
            </ParticipantProvider>
          </ProjectProvider>
        }
      />

      <Route
        path={'/:deliverableId/submissions/:projectId/edit'}
        element={
          <ProjectProvider>
            <ParticipantProvider>
              <DeliverableProvider>
                <QuestionsDeliverableEdit />
              </DeliverableProvider>
            </ParticipantProvider>
          </ProjectProvider>
        }
      />

      <Route path={'*'} element={<DeliverablesList />} />
    </Routes>
  );
};

export default DeliverablesRouter;
