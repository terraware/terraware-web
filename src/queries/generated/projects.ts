import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listProjects: build.query<ListProjectsApiResponse, ListProjectsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/projects`,
        params: {
          organizationId: queryArg,
        },
      }),
    }),
    createProject: build.mutation<CreateProjectApiResponse, CreateProjectApiArg>({
      query: (queryArg) => ({ url: `/api/v1/projects`, method: 'POST', body: queryArg }),
    }),
    deleteProject: build.mutation<DeleteProjectApiResponse, DeleteProjectApiArg>({
      query: (queryArg) => ({ url: `/api/v1/projects/${queryArg}`, method: 'DELETE' }),
    }),
    getProject: build.query<GetProjectApiResponse, GetProjectApiArg>({
      query: (queryArg) => ({ url: `/api/v1/projects/${queryArg}` }),
    }),
    updateProject: build.mutation<UpdateProjectApiResponse, UpdateProjectApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/projects/${queryArg.id}`,
        method: 'PUT',
        body: queryArg.updateProjectRequestPayload,
      }),
    }),
    assignProject: build.mutation<AssignProjectApiResponse, AssignProjectApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/projects/${queryArg.id}/assign`,
        method: 'POST',
        body: queryArg.assignProjectRequestPayload,
      }),
    }),
    getInternalUsers: build.query<GetInternalUsersApiResponse, GetInternalUsersApiArg>({
      query: (queryArg) => ({ url: `/api/v1/projects/${queryArg}/internalUsers` }),
    }),
    updateInternalUser: build.mutation<UpdateInternalUserApiResponse, UpdateInternalUserApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/projects/${queryArg.id}/internalUsers`,
        method: 'PUT',
        body: queryArg.updateProjectInternalUserRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListProjectsApiResponse = /** status 200 OK */ ListProjectsResponsePayload;
export type ListProjectsApiArg =
  /** If specified, list projects in this organization. If absent, list projects in all the user's organizations. */
  number | undefined;
export type CreateProjectApiResponse = /** status 200 OK */ CreateProjectResponsePayload;
export type CreateProjectApiArg = CreateProjectRequestPayload;
export type DeleteProjectApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type DeleteProjectApiArg = number;
export type GetProjectApiResponse = /** status 200 OK */ GetProjectResponsePayload;
export type GetProjectApiArg = number;
export type UpdateProjectApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateProjectApiArg = {
  id: number;
  updateProjectRequestPayload: UpdateProjectRequestPayload;
};
export type AssignProjectApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type AssignProjectApiArg = {
  id: number;
  assignProjectRequestPayload: AssignProjectRequestPayload;
};
export type GetInternalUsersApiResponse = /** status 200 OK */ ListProjectInternalUsersResponsePayload;
export type GetInternalUsersApiArg = number;
export type UpdateInternalUserApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateInternalUserApiArg = {
  id: number;
  updateProjectInternalUserRequestPayload: UpdateProjectInternalUserRequestPayload;
};
export type ProjectPayload = {
  cohortId?: number;
  cohortPhase?:
    | 'Phase 0 - Due Diligence'
    | 'Phase 1 - Feasibility Study'
    | 'Phase 2 - Plan and Scale'
    | 'Phase 3 - Implement and Monitor'
    | 'Pre-Screen'
    | 'Application';
  createdBy?: number;
  createdTime?: string;
  description?: string;
  id: number;
  modifiedBy?: number;
  modifiedTime?: string;
  name: string;
  organizationId: number;
  participantId?: number;
};
export type SuccessOrError = 'ok' | 'error';
export type ListProjectsResponsePayload = {
  projects: ProjectPayload[];
  status: SuccessOrError;
};
export type CreateProjectResponsePayload = {
  id: number;
  status: SuccessOrError;
};
export type CreateProjectRequestPayload = {
  description?: string;
  name: string;
  organizationId: number;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type GetProjectResponsePayload = {
  project: ProjectPayload;
  status: SuccessOrError;
};
export type UpdateProjectRequestPayload = {
  description?: string;
  name: string;
};
export type AssignProjectRequestPayload = {
  accessionIds?: number[];
  batchIds?: number[];
  plantingSiteIds?: number[];
};
export type ProjectInternalUserResponsePayload = {
  createdTime: string;
  email: string;
  firstName?: string;
  lastName?: string;
  modifiedTime: string;
  role?:
    | 'Project Lead'
    | 'Restoration Lead'
    | 'Social Lead'
    | 'GIS Lead'
    | 'Carbon Lead'
    | 'Phase Lead'
    | 'Regional Expert'
    | 'Project Finance Lead'
    | 'Climate Impact Lead'
    | 'Legal Lead'
    | 'Consultant';
  roleName?: string;
  userId: number;
};
export type ListProjectInternalUsersResponsePayload = {
  status: SuccessOrError;
  users: ProjectInternalUserResponsePayload[];
};
export type InternalUserPayload = {
  role?:
    | 'Project Lead'
    | 'Restoration Lead'
    | 'Social Lead'
    | 'GIS Lead'
    | 'Carbon Lead'
    | 'Phase Lead'
    | 'Regional Expert'
    | 'Project Finance Lead'
    | 'Climate Impact Lead'
    | 'Legal Lead'
    | 'Consultant';
  roleName?: string;
  userId: number;
};
export type UpdateProjectInternalUserRequestPayload = {
  internalUsers: InternalUserPayload[];
};
export const {
  useListProjectsQuery,
  useLazyListProjectsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectQuery,
  useLazyGetProjectQuery,
  useUpdateProjectMutation,
  useAssignProjectMutation,
  useGetInternalUsersQuery,
  useLazyGetInternalUsersQuery,
  useUpdateInternalUserMutation,
} = injectedRtkApi;
