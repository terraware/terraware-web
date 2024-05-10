import React, { Navigate, Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import ParticipantProvider from 'src/providers/Participant/ParticipantProvider';
import ParticipantProjectSpeciesProvider from 'src/providers/ParticipantProject/ParticipantProjectSpeciesProvider';
import ProjectProvider from 'src/providers/Project/ProjectProvider';

import Species from '../Species';
import SpeciesEditView from '../Species/SpeciesEditView';
import DeliverableViewWrapper from './DeliverableViewWrapper';
import DeliverablesList from './DeliverablesList';

const DeliverablesRouter = () => {
  return (
    <Routes>
      <Route
        path={'/:deliverableId/submissions/:projectId'}
        element={
          <ProjectProvider>
            <ParticipantProvider>
              <ParticipantProjectSpeciesProvider>
                <DeliverableViewWrapper />
              </ParticipantProjectSpeciesProvider>
            </ParticipantProvider>
          </ProjectProvider>
        }
      />
      <Route
        path={'/:deliverableId/submissions/:projectId/species/:speciesId'}
        element={
          <ProjectProvider>
            <ParticipantProvider>
              <ParticipantProjectSpeciesProvider>
                <Species />
              </ParticipantProjectSpeciesProvider>
            </ParticipantProvider>
          </ProjectProvider>
        }
      />
      <Route
        path={'/:deliverableId/submissions/:projectId/species/:speciesId/edit'}
        element={
          <ProjectProvider>
            <ParticipantProvider>
              <ParticipantProjectSpeciesProvider>
                <SpeciesEditView />
              </ParticipantProjectSpeciesProvider>
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
