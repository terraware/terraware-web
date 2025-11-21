import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listFundingEntities: build.query<ListFundingEntitiesApiResponse, ListFundingEntitiesApiArg>({
      query: () => ({ url: `/api/v1/funder/entities` }),
    }),
    createFundingEntity: build.mutation<CreateFundingEntityApiResponse, CreateFundingEntityApiArg>({
      query: (queryArg) => ({ url: `/api/v1/funder/entities`, method: 'POST', body: queryArg }),
    }),
    getProjectFundingEntities: build.query<GetProjectFundingEntitiesApiResponse, GetProjectFundingEntitiesApiArg>({
      query: (queryArg) => ({ url: `/api/v1/funder/entities/projects/${queryArg}` }),
    }),
    getFundingEntity1: build.query<GetFundingEntity1ApiResponse, GetFundingEntity1ApiArg>({
      query: (queryArg) => ({ url: `/api/v1/funder/entities/users/${queryArg}` }),
    }),
    deleteFundingEntity: build.mutation<DeleteFundingEntityApiResponse, DeleteFundingEntityApiArg>({
      query: (queryArg) => ({ url: `/api/v1/funder/entities/${queryArg}`, method: 'DELETE' }),
    }),
    getFundingEntity: build.query<GetFundingEntityApiResponse, GetFundingEntityApiArg>({
      query: (queryArg) => ({ url: `/api/v1/funder/entities/${queryArg}` }),
    }),
    updateFundingEntity: build.mutation<UpdateFundingEntityApiResponse, UpdateFundingEntityApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/funder/entities/${queryArg.fundingEntityId}`,
        method: 'PUT',
        body: queryArg.updateFundingEntityRequestPayload,
      }),
    }),
    removeFunder: build.mutation<RemoveFunderApiResponse, RemoveFunderApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/funder/entities/${queryArg.fundingEntityId}/users`,
        method: 'DELETE',
        body: queryArg.deleteFundersRequestPayload,
      }),
    }),
    getFunders: build.query<GetFundersApiResponse, GetFundersApiArg>({
      query: (queryArg) => ({ url: `/api/v1/funder/entities/${queryArg}/users` }),
    }),
    inviteFunder: build.mutation<InviteFunderApiResponse, InviteFunderApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/funder/entities/${queryArg.fundingEntityId}/users`,
        method: 'POST',
        body: queryArg.inviteFundingEntityFunderRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListFundingEntitiesApiResponse =
  /** status 200 The requested operation succeeded. */ ListFundingEntitiesPayload;
export type ListFundingEntitiesApiArg = void;
export type CreateFundingEntityApiResponse = /** status 200 OK */ GetFundingEntityResponsePayload;
export type CreateFundingEntityApiArg = CreateFundingEntityRequestPayload;
export type GetProjectFundingEntitiesApiResponse = /** status 200 OK */ ListFundingEntitiesPayload;
export type GetProjectFundingEntitiesApiArg = number;
export type GetFundingEntity1ApiResponse = /** status 200 OK */ GetFundingEntityResponsePayload;
export type GetFundingEntity1ApiArg = number;
export type DeleteFundingEntityApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteFundingEntityApiArg = number;
export type GetFundingEntityApiResponse =
  /** status 200 The requested operation succeeded. */ GetFundingEntityResponsePayload;
export type GetFundingEntityApiArg = number;
export type UpdateFundingEntityApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateFundingEntityApiArg = {
  fundingEntityId: number;
  updateFundingEntityRequestPayload: UpdateFundingEntityRequestPayload;
};
export type RemoveFunderApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type RemoveFunderApiArg = {
  fundingEntityId: number;
  deleteFundersRequestPayload: DeleteFundersRequestPayload;
};
export type GetFundersApiResponse = /** status 200 OK */ GetFundersResponsePayload;
export type GetFundersApiArg = number;
export type InviteFunderApiResponse = /** status 200 OK */ InviteFundingEntityFunderResponsePayload;
export type InviteFunderApiArg = {
  fundingEntityId: number;
  inviteFundingEntityFunderRequestPayload: InviteFundingEntityFunderRequestPayload;
};
export type FundingProjectPayload = {
  dealName: string;
  projectId: number;
};
export type FundingEntityPayload = {
  id: number;
  name: string;
  projects: FundingProjectPayload[];
};
export type SuccessOrError = 'ok' | 'error';
export type ListFundingEntitiesPayload = {
  fundingEntities: FundingEntityPayload[];
  status: SuccessOrError;
};
export type GetFundingEntityResponsePayload = {
  fundingEntity: FundingEntityPayload;
  status: SuccessOrError;
};
export type CreateFundingEntityRequestPayload = {
  name: string;
  projects?: number[];
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
export type UpdateFundingEntityRequestPayload = {
  name: string;
  projects?: number[];
};
export type DeleteFundersRequestPayload = {
  userIds: number[];
};
export type FunderPayload = {
  accountCreated: boolean;
  createdTime: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userId: number;
};
export type GetFundersResponsePayload = {
  funders: FunderPayload[];
  status: SuccessOrError;
};
export type InviteFundingEntityFunderResponsePayload = {
  email: string;
  status: SuccessOrError;
};
export type InviteFundingEntityFunderRequestPayload = {
  email: string;
};
export const {
  useListFundingEntitiesQuery,
  useLazyListFundingEntitiesQuery,
  useCreateFundingEntityMutation,
  useGetProjectFundingEntitiesQuery,
  useLazyGetProjectFundingEntitiesQuery,
  useGetFundingEntity1Query,
  useLazyGetFundingEntity1Query,
  useDeleteFundingEntityMutation,
  useGetFundingEntityQuery,
  useLazyGetFundingEntityQuery,
  useUpdateFundingEntityMutation,
  useRemoveFunderMutation,
  useGetFundersQuery,
  useLazyGetFundersQuery,
  useInviteFunderMutation,
} = injectedRtkApi;
