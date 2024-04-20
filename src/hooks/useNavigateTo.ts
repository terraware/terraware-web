import { useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

export default function useNavigateTo() {
  const history = useHistory();

  return useMemo(
    () => ({
      goToDeliverable: (deliverableId: number, projectId: number) =>
        history.push({
          pathname: APP_PATHS.DELIVERABLE_VIEW.replace(':deliverableId', `${deliverableId}`).replace(
            ':projectId',
            `${projectId}`
          ),
        }),

      goToDocuments: () =>
        history.push({
          pathname: APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENTS,
        }),

      goToDocumentNew: () =>
        history.push({
          pathname: APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENT_NEW,
        }),

      goToModule: (projectId: number, moduleId: number) =>
        history.push({
          pathname: APP_PATHS.PROJECT_MODULE.replace(':projectId', `${projectId}`).replace(':moduleId', `${moduleId}`),
        }),

      goToModuleAdditionalResources: (projectId: number, moduleId: number) =>
        history.push({
          pathname: APP_PATHS.PROJECT_MODULE_ADDITIONAL_RESOURCES.replace(':projectId', `${projectId}`).replace(
            ':moduleId',
            `${moduleId}`
          ),
        }),

      goToModulePreparationMaterials: (projectId: number, moduleId: number) =>
        history.push({
          pathname: APP_PATHS.PROJECT_MODULE_PREPARATION_MATERIALS.replace(':projectId', `${projectId}`).replace(
            ':moduleId',
            `${moduleId}`
          ),
        }),

      goToModuleEvent: (projectId: number, eventId: number, moduleId: number) =>
        history.push({
          pathname: APP_PATHS.PROJECT_MODULE_EVENT.replace(':projectId', `${projectId}`)
            .replace(':moduleId', `${moduleId}`)
            .replace(':eventId', `${eventId}`),
        }),

      goToParticipant: (participantId: number) =>
        history.push({
          pathname: APP_PATHS.ACCELERATOR_PARTICIPANTS_VIEW.replace(':participantId', `${participantId}`),
        }),

      goToParticipantsList: () =>
        history.push({
          pathname: APP_PATHS.ACCELERATOR_OVERVIEW,
          search: 'tab=participants',
        }),

      goToParticipantProject: (projectId: number) =>
        history.push({ pathname: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${projectId}`) }),

      goToParticipantProjectEdit: (projectId: number) =>
        history.push({ pathname: APP_PATHS.ACCELERATOR_PROJECT_EDIT.replace(':projectId', `${projectId}`) }),

      goToParticipantProjectList: () =>
        history.push({
          pathname: APP_PATHS.ACCELERATOR_OVERVIEW,
          search: 'tab=projects',
        }),
    }),
    [history]
  );
}
