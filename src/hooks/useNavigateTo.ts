import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import { ModuleContentType } from 'src/types/Module';
import { SupportRequestType, getSupportRequestSubpath } from 'src/types/Support';

export default function useNavigateTo() {
  const navigate = useNavigate();

  return useMemo(
    () => ({
      goToAccelerator: () => {
        navigate({ pathname: APP_PATHS.ACCELERATOR });
      },

      goToAcceleratorApplication: (applicationId: number) => {
        navigate({ pathname: APP_PATHS.ACCELERATOR_APPLICATION.replace(':applicationId', `${applicationId}`) });
      },

      goToAcceleratorApplicationMap: (applicationId: number) => {
        navigate({ pathname: APP_PATHS.ACCELERATOR_APPLICATION_MAP.replace(':applicationId', `${applicationId}`) });
      },

      goToAcceleratorApplicationMapUpload: (applicationId: number) => {
        navigate({
          pathname: APP_PATHS.ACCELERATOR_APPLICATION_MAP_UPLOAD.replace(':applicationId', `${applicationId}`),
        });
      },

      goToApplication: (applicationId: number) => {
        navigate({ pathname: APP_PATHS.APPLICATION_OVERVIEW.replace(':applicationId', `${applicationId}`) });
      },

      goToApplicationList: () => {
        navigate({ pathname: APP_PATHS.APPLICATIONS });
      },

      goToApplicationMap: (applicationId: number) => {
        navigate({
          pathname: APP_PATHS.APPLICATION_MAP.replace(':applicationId', `${applicationId}`),
        });
      },

      goToApplicationMapUpdate: (applicationId: number) => {
        navigate({
          pathname: APP_PATHS.APPLICATION_MAP_UPDATE.replace(':applicationId', `${applicationId}`),
        });
      },

      goToApplicationMapUpload: (applicationId: number) => {
        navigate({
          pathname: APP_PATHS.APPLICATION_MAP_UPLOAD.replace(':applicationId', `${applicationId}`),
        });
      },

      goToApplicationPrescreen: (applicationId: number) => {
        navigate({
          pathname: APP_PATHS.APPLICATION_PRESCREEN.replace(':applicationId', `${applicationId}`),
        });
      },

      goToApplicationPrescreenResult: (applicationId: number) => {
        navigate({
          pathname: APP_PATHS.APPLICATION_PRESCREEN_RESULT.replace(':applicationId', `${applicationId}`),
        });
      },

      goToApplicationReview: (applicationId: number) => {
        navigate({
          pathname: APP_PATHS.APPLICATION_REVIEW.replace(':applicationId', `${applicationId}`),
        });
      },

      goToApplicationSection: (applicationId: number, sectionId: number) => {
        navigate({
          pathname: APP_PATHS.APPLICATION_SECTION.replace(':applicationId', `${applicationId}`).replace(
            ':sectionId',
            `${sectionId}`
          ),
        });
      },

      goToApplicationSectionDeliverable: (applicationId: number, sectionId: number, deliverableId: number) => {
        navigate({
          pathname: APP_PATHS.APPLICATION_SECTION_DELIVERABLE.replace(':applicationId', `${applicationId}`)
            .replace(':sectionId', `${sectionId}`)
            .replace(':deliverableId', `${deliverableId}`),
        });
      },

      goToApplicationSectionDeliverableEdit: (
        applicationId: number,
        sectionId: number,
        deliverableId: number,
        variableId?: number
      ) => {
        navigate({
          pathname: APP_PATHS.APPLICATION_SECTION_DELIVERABLE_EDIT.replace(':applicationId', `${applicationId}`)
            .replace(':sectionId', `${sectionId}`)
            .replace(':deliverableId', `${deliverableId}`),
          ...(variableId ? { search: `variableId=${variableId}` } : {}),
        });
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

      goToDeliverableEdit: (deliverableId: number, projectId: number, variableId?: number) =>
        navigate({
          pathname: APP_PATHS.DELIVERABLE_EDIT.replace(':deliverableId', `${deliverableId}`).replace(
            ':projectId',
            `${projectId}`
          ),
          ...(variableId ? { search: `variableId=${variableId}` } : {}),
        }),

      goToDocuments: () =>
        navigate({
          pathname: APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENTS,
        }),

      goToDocumentNew: () =>
        navigate({
          pathname: APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENT_NEW,
        }),

      goToHelpSupport: () => {
        navigate({ pathname: APP_PATHS.HELP_SUPPORT });
      },

      goToHome: () =>
        navigate({
          pathname: APP_PATHS.HOME,
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
