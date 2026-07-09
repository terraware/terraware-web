import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    deleteGlobalRoles: build.mutation<DeleteGlobalRolesApiResponse, DeleteGlobalRolesApiArg>({
      query: (queryArg) => ({ url: `/api/v1/globalRoles/users`, method: 'DELETE', body: queryArg }),
    }),
    listGlobalRoles: build.query<ListGlobalRolesApiResponse, ListGlobalRolesApiArg>({
      query: () => ({ url: `/api/v1/globalRoles/users` }),
    }),
    updateGlobalRoles: build.mutation<UpdateGlobalRolesApiResponse, UpdateGlobalRolesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/users/${queryArg.userId}/globalRoles`,
        method: 'POST',
        body: queryArg.updateGlobalRolesRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type DeleteGlobalRolesApiResponse = /** status 200 The requested operation succeeded. */ SuccessResponsePayload;
export type DeleteGlobalRolesApiArg = DeleteGlobalRolesRequestPayload;
export type ListGlobalRolesApiResponse =
  /** status 200 The requested operation succeeded. */ GlobalRoleUsersListResponsePayload;
export type ListGlobalRolesApiArg = void;
export type UpdateGlobalRolesApiResponse = /** status 200 The requested operation succeeded. */ SuccessResponsePayload;
export type UpdateGlobalRolesApiArg = {
  userId: number;
  updateGlobalRolesRequestPayload: UpdateGlobalRolesRequestPayload;
};
export type SuccessOrError = 'ok' | 'error';
export type SuccessResponsePayload = {
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type DeleteGlobalRolesRequestPayload = {
  userIds: number[];
};
export type UserWithGlobalRolesPayload = {
  createdTime: string;
  email: string;
  firstName?: string;
  globalRoles: ('Super-Admin' | 'Accelerator Admin' | 'TF Expert' | 'Read Only')[];
  id: number;
  internalInterests: (
    | 'Compliance'
    | 'Financial Viability'
    | 'GIS'
    | 'Carbon Eligibility'
    | 'Stakeholders and Community Impact'
    | 'Proposed Restoration Activities'
    | 'Verra Non-Permanence Risk Tool (NPRT)'
    | 'Supplemental Files'
    | 'Sourcing'
  )[];
  lastName?: string;
};
export type GlobalRoleUsersListResponsePayload = {
  status: SuccessOrError;
  users: UserWithGlobalRolesPayload[];
};
export type UpdateGlobalRolesRequestPayload = {
  globalRoles: ('Super-Admin' | 'Accelerator Admin' | 'TF Expert' | 'Read Only')[];
};
export const {
  useDeleteGlobalRolesMutation,
  useListGlobalRolesQuery,
  useLazyListGlobalRolesQuery,
  useUpdateGlobalRolesMutation,
} = injectedRtkApi;
