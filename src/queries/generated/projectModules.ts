import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listProjectModules: build.query<ListProjectModulesApiResponse, ListProjectModulesApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/projects/${queryArg}/modules` }),
    }),
    deleteProjectModule: build.mutation<DeleteProjectModuleApiResponse, DeleteProjectModuleApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/modules/${queryArg.moduleId}`,
        method: 'DELETE',
      }),
    }),
    getProjectModule: build.query<GetProjectModuleApiResponse, GetProjectModuleApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/projects/${queryArg.projectId}/modules/${queryArg.moduleId}` }),
    }),
    updateProjectModule: build.mutation<UpdateProjectModuleApiResponse, UpdateProjectModuleApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/modules/${queryArg.moduleId}`,
        method: 'PUT',
        body: queryArg.updateProjectModuleRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListProjectModulesApiResponse =
  /** status 200 The requested operation succeeded. */ ListProjectModulesResponsePayload;
export type ListProjectModulesApiArg = number;
export type DeleteProjectModuleApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteProjectModuleApiArg = {
  projectId: number;
  moduleId: number;
};
export type GetProjectModuleApiResponse =
  /** status 200 The requested operation succeeded. */ GetProjectModuleResponsePayload;
export type GetProjectModuleApiArg = {
  projectId: number;
  moduleId: number;
};
export type UpdateProjectModuleApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateProjectModuleApiArg = {
  projectId: number;
  moduleId: number;
  updateProjectModuleRequestPayload: UpdateProjectModuleRequestPayload;
};
export type ProjectModulePayload = {
  additionalResources?: string;
  endDate: string;
  eventDescriptions: {
    [key: string]: string;
  };
  id: number;
  isActive: boolean;
  name: string;
  overview?: string;
  preparationMaterials?: string;
  startDate: string;
  title: string;
};
export type SuccessOrError = 'ok' | 'error';
export type ListProjectModulesResponsePayload = {
  modules: ProjectModulePayload[];
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type GetProjectModuleResponsePayload = {
  module: ProjectModulePayload;
  status: SuccessOrError;
};
export type UpdateProjectModuleRequestPayload = {
  endDate: string;
  startDate: string;
  title: string;
};
export const {
  useListProjectModulesQuery,
  useLazyListProjectModulesQuery,
  useDeleteProjectModuleMutation,
  useGetProjectModuleQuery,
  useLazyGetProjectModuleQuery,
  useUpdateProjectModuleMutation,
} = injectedRtkApi;
