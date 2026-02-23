import { useMemo } from 'react';

import { APP_PATHS } from 'src/constants';
import { ModuleContentType } from 'src/types/Module';
import { SupportRequestType, getSupportRequestSubpath } from 'src/types/Support';

import { useSyncNavigate } from './useSyncNavigate';

export default function useNavigateTo() {
  const navigate = useSyncNavigate();

  const searchParamsWithMapViewState = () => {
    const params = new URLSearchParams(location.search);
    const newParams = new URLSearchParams();
    if (params.has('lat')) {
      newParams.set('lat', params.get('lat')!);
    }
    if (params.has('lng')) {
      newParams.set('lng', params.get('lng')!);
    }
    if (params.has('zoom')) {
      newParams.set('zoom', params.get('zoom')!);
    }
    return newParams;
  };

  return useMemo(
    () => ({
      goToAccelerator: () => {
        navigate({ pathname: APP_PATHS.ACCELERATOR });
      },

      goToAcceleratorActivityCreate: (projectId: number) => {
        const params = searchParamsWithMapViewState();
        params.set('source', window.location.pathname);
        navigate({
          pathname: APP_PATHS.ACCELERATOR_ACTIVITY_LOG_NEW.replace(':projectId', `${projectId}`),
          search: params.toString(),
        });
      },

      goToAcceleratorActivityEdit: (projectId: number, activityId: number) => {
        const params = searchParamsWithMapViewState();
        params.set('source', window.location.pathname);
        navigate({
          pathname: APP_PATHS.ACCELERATOR_ACTIVITY_LOG_EDIT.replace(':projectId', `${projectId}`).replace(
            ':activityId',
            `${activityId}`
          ),
          search: params.toString(),
        });
      },

      goToAcceleratorActivityLog: (activityId?: number) => {
        const params = searchParamsWithMapViewState();
        if (activityId !== undefined) {
          params.set('activityId', activityId.toString());
        }
        navigate({
          pathname: APP_PATHS.ACCELERATOR_ACTIVITY_LOG,
          search: params.toString(),
        });
      },

      goToAcceleratorApplication: (applicationId: number) => {
        navigate({ pathname: APP_PATHS.ACCELERATOR_APPLICATION.replace(':applicationId', `${applicationId}`) });
      },

      goToAcceleratorApplicationDeliverable: (applicationId: number, deliverableId: number) => {
        navigate({
          pathname: APP_PATHS.ACCELERATOR_APPLICATION_DELIVERABLE.replace(':applicationId', `${applicationId}`).replace(
            ':deliverableId',
            `${deliverableId}`
          ),
        });
      },

      goToAcceleratorApplicationMap: (applicationId: number) => {
        navigate({
          pathname: APP_PATHS.ACCELERATOR_APPLICATION_MAP.replace(':applicationId', `${applicationId}`),
        });
      },

      goToAcceleratorProject: (projectId: number, activityId?: number, tab?: string) => {
        const params = searchParamsWithMapViewState();
        if (activityId !== undefined) {
          params.set('activityId', activityId.toString());
          if (tab) {
            params.set('tab', tab);
          }
        }
        navigate({
          pathname: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${projectId}`),
          search: params.toString(),
        });
      },

      goToAcceleratorProjectEdit: (projectId: number) =>
        navigate({ pathname: APP_PATHS.ACCELERATOR_PROJECT_EDIT.replace(':projectId', `${projectId}`) }),

      goToAcceleratorProjectList: () => navigate({ pathname: APP_PATHS.ACCELERATOR_PROJECTS }),

      goToAcceleratorProjectModulesEdit: (projectId: number) => {
        navigate({ pathname: APP_PATHS.ACCELERATOR_PROJECT_MODULES_EDIT.replace(':projectId', `${projectId}`) });
      },

      goToAcceleratorProjectScore: (projectId: number) => {
        navigate({ pathname: APP_PATHS.ACCELERATOR_PROJECT_SCORES.replace(':projectId', `${projectId}`) });
      },

      goToAcceleratorProjectScoreEdit: (projectId: number) => {
        navigate({ pathname: APP_PATHS.ACCELERATOR_PROJECT_SCORES_EDIT.replace(':projectId', `${projectId}`) });
      },

      goToAcceleratorProjectSpecies: (deliverableId: number, projectId: number, acceleratorProjectSpeciesId: number) =>
        navigate({
          pathname: APP_PATHS.ACCELERATOR_SPECIES.replace(
            ':acceleratorProjectSpeciesId',
            `${acceleratorProjectSpeciesId}`
          )
            .replace(':projectId', `${projectId}`)
            .replace(':deliverableId', `${deliverableId}`),
        }),

      goToAcceleratorProjectSpeciesEdit: (
        deliverableId: number,
        projectId: number,
        acceleratorProjectSpeciesId: number
      ) =>
        navigate(
          APP_PATHS.ACCELERATOR_SPECIES_EDIT.replace(':acceleratorProjectSpeciesId', `${acceleratorProjectSpeciesId}`)
            .replace(':projectId', `${projectId}`)
            .replace(':deliverableId', `${deliverableId}`)
        ),

      goToAcceleratorProjectVote: (projectId: number) => {
        navigate({ pathname: APP_PATHS.ACCELERATOR_PROJECT_VOTES.replace(':projectId', `${projectId}`) });
      },

      goToAcceleratorProjectVoteEdit: (projectId: number) => {
        navigate({ pathname: APP_PATHS.ACCELERATOR_PROJECT_VOTES_EDIT.replace(':projectId', `${projectId}`) });
      },

      goToAcceleratorReport: (reportId: number, projectId: number) =>
        navigate({
          pathname: APP_PATHS.REPORTS_VIEW.replace(':reportId', `${reportId}`).replace(':projectId', `${projectId}`),
        }),

      goToAcceleratorReportEdit: (reportId: number, projectId: number) =>
        navigate({
          pathname: APP_PATHS.REPORTS_EDIT.replace(':reportId', `${reportId}`).replace(':projectId', `${projectId}`),
        }),

      goToActivityCreate: (projectId: number) => {
        const params = searchParamsWithMapViewState();
        navigate({
          pathname: APP_PATHS.ACTIVITY_LOG_NEW.replace(':projectId', `${projectId}`),
          search: params.toString(),
        });
      },

      goToActivityEdit: (projectId: number, activityId: number) => {
        const params = searchParamsWithMapViewState();
        navigate({
          pathname: APP_PATHS.ACTIVITY_LOG_EDIT.replace(':projectId', `${projectId}`).replace(
            ':activityId',
            `${activityId}`
          ),
          search: params.toString(),
        });
      },

      goToActivityLog: (activityId?: number) => {
        const params = searchParamsWithMapViewState();
        if (activityId !== undefined) {
          params.set('activityId', activityId.toString());
        }
        navigate({
          pathname: APP_PATHS.ACTIVITY_LOG,
          search: params.toString(),
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

      goToEditFundingEntity: (fundingEntityId: number | string) =>
        navigate(APP_PATHS.ACCELERATOR_FUNDING_ENTITIES_EDIT.replace(':fundingEntityId', `${fundingEntityId}`)),

      goToFundingEntities: () => navigate({ pathname: APP_PATHS.ACCELERATOR_FUNDING_ENTITIES }),

      goToFundingEntity: (fundingEntityId: number | string) =>
        navigate({
          pathname: APP_PATHS.ACCELERATOR_FUNDING_ENTITIES_VIEW.replace(':fundingEntityId', String(fundingEntityId)),
        }),

      goToNewFundingEntity: () => navigate({ pathname: APP_PATHS.ACCELERATOR_FUNDING_ENTITIES_NEW }),

      goToHelpSupport: () => {
        navigate({ pathname: APP_PATHS.HELP_SUPPORT });
      },

      goToHome: () =>
        navigate({
          pathname: APP_PATHS.HOME,
        }),

      goToModule: (projectId: number, moduleId: number) => {
        navigate({
          pathname: APP_PATHS.PROJECT_MODULE.replace(':projectId', `${projectId}`).replace(':moduleId', `${moduleId}`),
        });
        window.scrollTo(0, 0);
      },
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

      goToNewAccession: () => {
        navigate({
          pathname: APP_PATHS.ACCESSIONS2_NEW,
        });
        window.scrollTo(0, 0);
      },

      goToPlantingSiteView: (plantingSiteId: number) =>
        navigate(APP_PATHS.PLANTING_SITES_VIEW.replace(':plantingSiteId', `${plantingSiteId}`)),
      goToPlantingSitesView: (newSite: boolean) => navigate(`${APP_PATHS.PLANTING_SITES}${newSite ? '?new=true' : ''}`),

      goToSettings: () => navigate(APP_PATHS.SETTINGS),

      goToAcceleratorEditReportSettings: (projectId: string) =>
        navigate(APP_PATHS.ACCELERATOR_PROJECT_REPORTS_EDIT.replace(':projectId', projectId)),

      goToNewProjectMetric: (projectId: string) =>
        navigate(APP_PATHS.ACCELERATOR_PROJECT_REPORTS_METRICS_NEW.replace(':projectId', projectId)),

      goToNewStandardMetric: (projectId: string) =>
        navigate(APP_PATHS.ACCELERATOR_PROJECT_REPORTS_STANDARD_METRICS_NEW.replace(':projectId', projectId)),
    }),
    [navigate]
  );
}
