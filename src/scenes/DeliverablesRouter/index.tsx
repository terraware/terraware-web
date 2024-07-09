import React from 'react';
import { Route, Routes } from 'react-router-dom';

import DeliverableProvider from 'src/providers/Deliverable/DeliverableProvider';
import ParticipantProvider from 'src/providers/Participant/ParticipantProvider';
import ProjectProvider from 'src/providers/Project/ProjectProvider';

import ParticipantProjectProvider from '../AcceleratorRouter/ParticipantProjects/ParticipantProjectProvider';
import DeliverableViewWrapper from './DeliverableViewWrapper';
import DeliverablesList from './DeliverablesList';
import QuestionsDeliverableEdit from './QuestionsDeliverableEditView';

const DeliverablesRouter = (): JSX.Element => {
  return (
    <Routes>
      <Route
        path={'/:deliverableId/submissions/:projectId'}
        element={
          <ProjectProvider>
            <ParticipantProvider>
              <ParticipantProjectProvider>
                <DeliverableProvider>
                  <DeliverableViewWrapper />
                </DeliverableProvider>
              </ParticipantProjectProvider>
            </ParticipantProvider>
          </ProjectProvider>
        }
      />

      <Route
        path={'/:deliverableId/submissions/:projectId/edit'}
        element={
          <ProjectProvider>
            <ParticipantProvider>
              <ParticipantProjectProvider>
                <DeliverableProvider>
                  <QuestionsDeliverableEdit />
                </DeliverableProvider>
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
