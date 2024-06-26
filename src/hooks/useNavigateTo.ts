import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import { ModuleContentType } from 'src/types/Module';
import { SupportRequestType, getSupportRequestSubpath } from 'src/types/Support';

export default function useNavigateTo() {
  const navigate = useNavigate();

  return useMemo(
    () => ({
      goToHelpSupport: () => {
        navigate({ pathname: APP_PATHS.HELP_SUPPORT });
      },

      goToContactUsForm: (requestType: SupportRequestType) => {
        navigate({
          pathname: APP_PATHS.HELP_SUPPORT_FORM.replace(':requestType', getSupportRequestSubpath(requestType)),
        });
      },

      goToDeliverable: (deliverableId: number, projectId: number) =>
        navigate({
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

      goToModuleContent: (projectId: number, moduleId: number, type: ModuleContentType) => {
        let pathname = '';
        switch (type) {
          case 'additionalResources':
            pathname = APP_PATHS.PROJECT_MODULE_ADDITIONAL_RESOURCES;
            break;
          case 'preparationMaterials':
            pathname = APP_PATHS.PROJECT_MODULE_PREPARATION_MATERIALS;
            break;
          default:
            return;
        }

        navigate({
          pathname: pathname.replace(':projectId', `${projectId}`).replace(':moduleId', `${moduleId}`),
        });
      },

      goToModuleEventSession: (projectId: number, moduleId: number, sessionId: number) =>
        navigate({
          pathname: APP_PATHS.PROJECT_MODULE_SESSION.replace(':projectId', `${projectId}`)
            .replace(':moduleId', `${moduleId}`)
            .replace(':sessionId', `${sessionId}`),
        }),

      goToModules: (projectId: number) =>
        navigate({
          pathname: APP_PATHS.PROJECT_MODULES.replace(':projectId', `${projectId}`),
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

      goToParticipantProjectSpecies: (deliverableId: number, projectId: number, participantProjectSpeciesId: number) =>
        navigate({
          pathname: APP_PATHS.ACCELERATOR_SPECIES.replace(
            ':participantProjectSpeciesId',
            `${participantProjectSpeciesId}`
          )
            .replace(':projectId', `${projectId}`)
            .replace(':deliverableId', `${deliverableId}`),
        }),

      goToParticipantProjectSpeciesEdit: (
        deliverableId: number,
        projectId: number,
        participantProjectSpeciesId: number
      ) =>
        navigate(
          APP_PATHS.ACCELERATOR_SPECIES_EDIT.replace(':participantProjectSpeciesId', `${participantProjectSpeciesId}`)
            .replace(':projectId', `${projectId}`)
            .replace(':deliverableId', `${deliverableId}`)
        ),

      goToPlantingSiteView: (plantingSiteId: number) =>
        navigate(APP_PATHS.PLANTING_SITES_VIEW.replace(':plantingSiteId', `${plantingSiteId}`)),
    }),
    [navigate]
  );
}
