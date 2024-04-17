import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

export default function useNavigateTo() {
  const navigate = useNavigate();

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
        navigate({
          pathname: APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENTS,
        }),

      goToDocumentNew: () =>
        navigate({
          pathname: APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENT_NEW,
        }),

      goToModule: (projectId: number, moduleId: number) =>
        navigate({
          pathname: APP_PATHS.PROJECT_MODULE.replace(':projectId', `${projectId}`).replace(':moduleId', `${moduleId}`),
        }),

      goToModuleEvent: (projectId: number, eventId: number, moduleId: number) =>
        navigate({
          pathname: APP_PATHS.PROJECT_MODULE_EVENT.replace(':projectId', `${projectId}`)
            .replace(':moduleId', `${moduleId}`)
            .replace(':eventId', `${eventId}`),
        }),

      goToParticipant: (participantId: number) =>
        navigate({
          pathname: APP_PATHS.ACCELERATOR_PARTICIPANTS_VIEW.replace(':participantId', `${participantId}`),
        }),

      goToParticipantsList: () =>
        navigate({
          pathname: APP_PATHS.ACCELERATOR_OVERVIEW,
          search: 'tab=participants',
        }),

      goToParticipantProject: (projectId: number) =>
        navigate({ pathname: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${projectId}`) }),

      goToParticipantProjectEdit: (projectId: number) =>
        navigate({ pathname: APP_PATHS.ACCELERATOR_PROJECT_EDIT.replace(':projectId', `${projectId}`) }),

      goToParticipantProjectList: () =>
        navigate({
          pathname: APP_PATHS.ACCELERATOR_OVERVIEW,
          search: 'tab=projects',
        }),
    }),
    [navigate]
  );
}
