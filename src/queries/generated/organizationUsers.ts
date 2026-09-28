import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listOrganizationUsers: build.query<ListOrganizationUsersApiResponse, ListOrganizationUsersApiArg>({
      query: (queryArg) => ({ url: `/api/v1/organizations/${queryArg}/users` }),
    }),
    addOrganizationUser: build.mutation<AddOrganizationUserApiResponse, AddOrganizationUserApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/organizations/${queryArg.organizationId}/users`,
        method: 'POST',
        body: queryArg.addOrganizationUserRequestPayload,
      }),
    }),
    deleteOrganizationUser: build.mutation<DeleteOrganizationUserApiResponse, DeleteOrganizationUserApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/organizations/${queryArg.organizationId}/users/${queryArg.userId}`,
        method: 'DELETE',
      }),
    }),
    getOrganizationUser: build.query<GetOrganizationUserApiResponse, GetOrganizationUserApiArg>({
      query: (queryArg) => ({ url: `/api/v1/organizations/${queryArg.organizationId}/users/${queryArg.userId}` }),
    }),
    updateOrganizationUser: build.mutation<UpdateOrganizationUserApiResponse, UpdateOrganizationUserApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/organizations/${queryArg.organizationId}/users/${queryArg.userId}`,
        method: 'PUT',
        body: queryArg.updateOrganizationUserRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListOrganizationUsersApiResponse = /** status 200 OK */ ListOrganizationUsersResponsePayload;
export type ListOrganizationUsersApiArg = number;
export type AddOrganizationUserApiResponse = /** status 200 OK */ CreateOrganizationUserResponsePayload;
export type AddOrganizationUserApiArg = {
  organizationId: number;
  addOrganizationUserRequestPayload: AddOrganizationUserRequestPayload;
};
export type DeleteOrganizationUserApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteOrganizationUserApiArg = {
  organizationId: number;
  userId: number;
};
export type GetOrganizationUserApiResponse = /** status 200 OK */ GetOrganizationUserResponsePayload;
export type GetOrganizationUserApiArg = {
  organizationId: number;
  userId: number;
};
export type UpdateOrganizationUserApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateOrganizationUserApiArg = {
  organizationId: number;
  userId: number;
  updateOrganizationUserRequestPayload: UpdateOrganizationUserRequestPayload;
};
export type SuccessOrError = 'ok' | 'error';
export type OrganizationUserPayload = {
  /** Date and time the user was added to the organization. */
  addedTime: string;
  email: string;
  /** The user's first name. Not present if the user has been added to the organization but has not signed up for an account yet. */
  firstName?: string;
  id: number;
  /** The user's last name. Not present if the user has been added to the organization but has not signed up for an account yet. */
  lastName?: string;
  role: 'Contributor' | 'Manager' | 'Admin' | 'Owner' | 'Terraformation Contact';
};
export type ListOrganizationUsersResponsePayload = {
  status: SuccessOrError;
  users: OrganizationUserPayload[];
};
export type CreateOrganizationUserResponsePayload = {
  /** The ID of the newly-added user. */
  id: number;
  status: SuccessOrError;
};
export type AddOrganizationUserRequestPayload = {
  email: string;
  role: 'Contributor' | 'Manager' | 'Admin' | 'Owner' | 'Terraformation Contact';
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type GetOrganizationUserResponsePayload = {
  status: SuccessOrError;
  user: OrganizationUserPayload;
};
export type UpdateOrganizationUserRequestPayload = {
  role: 'Contributor' | 'Manager' | 'Admin' | 'Owner' | 'Terraformation Contact';
};
export const {
  useListOrganizationUsersQuery,
  useLazyListOrganizationUsersQuery,
  useAddOrganizationUserMutation,
  useDeleteOrganizationUserMutation,
  useGetOrganizationUserQuery,
  useLazyGetOrganizationUserQuery,
  useUpdateOrganizationUserMutation,
} = injectedRtkApi;
