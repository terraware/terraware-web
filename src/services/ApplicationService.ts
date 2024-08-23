import { paths } from 'src/api/types/generated-schema';
import { Application } from 'src/types/Application';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { SearchAndSortFn, SearchOrderConfig, searchAndSort as genericSearchAndSort } from 'src/utils/searchAndSort';

import HttpService, { Params, Response, Response2 } from './HttpService';
import ProjectsService from './ProjectsService';

/**
 * Service for application related functionality
 */
const APPLICATIONS_ENDPOINT = '/api/v1/accelerator/applications';
const APPLICATION_ENDPOINT = '/api/v1/accelerator/applications/{applicationId}';
const APPLICATION_BOUNDARY_ENDPOINT = '/api/v1/accelerator/applications/{applicationId}/boundary';
const APPLICATION_DELIVERABLES_ENDPOINT = '/api/v1/accelerator/applications/{applicationId}/deliverables';
const APPLICATION_HISTORY_ENDPOINT = '/api/v1/accelerator/applications/{applicationId}/history';
const APPLICATION_MODULES_ENDPOINT = '/api/v1/accelerator/applications/{applicationId}/modules';
const APPLICATION_MODULE_DELIVERABLES_ENDPOINT =
  '/api/v1/accelerator/applications/{applicationId}/modules/{moduleId}/deliverables';
const APPLICATION_RESTART_ENDPOINT = '/api/v1/accelerator/applications/{applicationId}/restart';
const APPLICATION_REVIEW_ENDPOINT = '/api/v1/accelerator/applications/{applicationId}/review';
const APPLICATION_SUBMIT_ENDPOINT = '/api/v1/accelerator/applications/{applicationId}/submit';

type ListApplicationsResponsePayload =
  paths[typeof APPLICATIONS_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type CreateApplicationResponsePayload =
  paths[typeof APPLICATIONS_ENDPOINT]['post']['responses'][200]['content']['application/json'];
type GetApplicationResponsePayload =
  paths[typeof APPLICATION_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type ListApplicationDeliverablesResponsePayload =
  paths[typeof APPLICATION_DELIVERABLES_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type ListApplicationHistoryResponsePayload =
  paths[typeof APPLICATION_HISTORY_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type ListApplicationModulesResponsePayload =
  paths[typeof APPLICATION_MODULES_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type ListApplicationModuleDeliverablesResponsePayload =
  paths[typeof APPLICATION_MODULE_DELIVERABLES_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type ReviewApplicationRequestPayload =
  paths[typeof APPLICATION_REVIEW_ENDPOINT]['post']['requestBody']['content']['application/json'];
type SubmitApplicationResponsePayload =
  paths[typeof APPLICATION_SUBMIT_ENDPOINT]['post']['responses'][200]['content']['application/json'];
type UpdateBoundaryRequestPayload =
  paths[typeof APPLICATION_BOUNDARY_ENDPOINT]['put']['requestBody']['content']['application/json'];

const listApplications = async (request: {
  organizationId?: number;
  listAll?: boolean;
  locale?: string;
  search?: SearchNodePayload;
  searchSortOrder?: SearchSortOrder;
  searchAndSort?: SearchAndSortFn<Application>;
}): Promise<Response2<ListApplicationsResponsePayload>> => {
  const searchAndSort = request.searchAndSort ?? genericSearchAndSort;
  const searchOrderConfig: SearchOrderConfig | undefined = request.searchSortOrder
    ? {
        locale: request.locale ?? null,
        sortOrder: request.searchSortOrder,
        numberFields: ['id', 'participantIds'],
      }
    : undefined;

  const params: Params = { listAll: `${request.listAll ?? false}` };
  if (request.organizationId !== undefined) {
    params.organizationId = `${request.organizationId}`;
  }

  const response = await HttpService.root(APPLICATIONS_ENDPOINT).get2<ListApplicationsResponsePayload>({
    params,
  });

  if (response && response.data) {
    response.data.applications = searchAndSort(response?.data?.applications || [], request.search, searchOrderConfig);
  }

  return response;
};

const createApplication = async (projectId: number): Promise<Response2<CreateApplicationResponsePayload>> => {
  return HttpService.root(APPLICATIONS_ENDPOINT).post2<CreateApplicationResponsePayload>({
    entity: { projectId },
  });
};

const createProjectApplication = async (
  projectName: string,
  organizationId: number
): Promise<Response2<CreateApplicationResponsePayload>> => {
  const projectRequest = await ProjectsService.createProject({ name: projectName, organizationId });

  if (projectRequest.requestSucceeded && projectRequest.data) {
    return createApplication(projectRequest.data.id);
  } else {
    return { ...projectRequest, data: undefined };
  }
};

const getApplication = async (applicationId: number): Promise<Response2<GetApplicationResponsePayload>> => {
  return HttpService.root(APPLICATION_ENDPOINT).get2<GetApplicationResponsePayload>({
    urlReplacements: { '{applicationId}': `${applicationId}` },
  });
};

const listApplicationDeliverables = async (
  applicationId: number
): Promise<Response2<ListApplicationDeliverablesResponsePayload>> => {
  return HttpService.root(APPLICATION_DELIVERABLES_ENDPOINT).get2<ListApplicationDeliverablesResponsePayload>({
    urlReplacements: { '{applicationId}': `${applicationId}` },
  });
};

const listApplicationHistory = async (
  applicationId: number
): Promise<Response2<ListApplicationHistoryResponsePayload>> => {
  return HttpService.root(APPLICATION_HISTORY_ENDPOINT).get2<ListApplicationHistoryResponsePayload>({
    urlReplacements: { '{applicationId}': `${applicationId}` },
  });
};

const listApplicationModules = async (
  applicationId: number
): Promise<Response2<ListApplicationModulesResponsePayload>> => {
  return HttpService.root(APPLICATION_MODULES_ENDPOINT).get2<ListApplicationModulesResponsePayload>({
    urlReplacements: { '{applicationId}': `${applicationId}` },
  });
};

const listApplicationModuleDeliverables = async (
  applicationId: number
): Promise<Response2<ListApplicationModuleDeliverablesResponsePayload>> => {
  return HttpService.root(
    APPLICATION_MODULE_DELIVERABLES_ENDPOINT
  ).get2<ListApplicationModuleDeliverablesResponsePayload>({
    urlReplacements: { '{applicationId}': `${applicationId}` },
  });
};

const restartApplication = async (applicationId: number): Promise<Response> => {
  return HttpService.root(APPLICATION_RESTART_ENDPOINT).post({
    urlReplacements: { '{applicationId}': `${applicationId}` },
  });
};

const submitApplication = async (applicationId: number): Promise<Response2<SubmitApplicationResponsePayload>> => {
  return HttpService.root(APPLICATION_SUBMIT_ENDPOINT).post2<SubmitApplicationResponsePayload>({
    urlReplacements: { '{applicationId}': `${applicationId}` },
  });
};

const reviewApplication = async (applicationId: number, entity: ReviewApplicationRequestPayload): Promise<Response> => {
  return HttpService.root(APPLICATION_REVIEW_ENDPOINT).post({
    entity,
    urlReplacements: { '{applicationId}': `${applicationId}` },
  });
};

const updateBoundary = async (applicationId: number, entity: UpdateBoundaryRequestPayload): Promise<Response> => {
  return HttpService.root(APPLICATION_BOUNDARY_ENDPOINT).put({
    entity,
    urlReplacements: { '{applicationId}': `${applicationId}` },
  });
};

const uploadBoundary = async (applicationId: number, file: File): Promise<Response> => {
  const headers = { 'content-type': 'multipart/form-data' };
  return HttpService.root(APPLICATION_BOUNDARY_ENDPOINT).post({
    entity: { file: file },
    headers,
    urlReplacements: { '{applicationId}': `${applicationId}` },
  });
};

/**
 * Exported functions
 */
const ApplicationService = {
  createApplication,
  createProjectApplication,
  getApplication,
  listApplications,
  listApplicationDeliverables,
  listApplicationHistory,
  listApplicationModules,
  listApplicationModuleDeliverables,
  restartApplication,
  reviewApplication,
  submitApplication,
  updateBoundary,
  uploadBoundary,
};

export default ApplicationService;
