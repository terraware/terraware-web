import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
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
export type GetInternalUsersApiResponse = /** status 200 OK */ ListProjectInternalUsersResponsePayload;
export type GetInternalUsersApiArg = number;
export type UpdateInternalUserApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateInternalUserApiArg = {
  id: number;
  updateProjectInternalUserRequestPayload: UpdateProjectInternalUserRequestPayload;
};
export type SuccessOrError = 'ok' | 'error';
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
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
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
export const { useGetInternalUsersQuery, useLazyGetInternalUsersQuery, useUpdateInternalUserMutation } = injectedRtkApi;
