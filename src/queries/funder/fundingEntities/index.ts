import { paths } from 'src/api/types/generated-schema';
import { baseApi } from 'src/queries/baseApi';
import { QueryTagTypes } from 'src/queries/tags';
import { Funder, FundingEntity } from 'src/types/FundingEntity';

const FUNDING_ENTITIES_LIST_ENDPOINT = '/api/v1/funder/entities';
const FUNDING_ENTITY_ENDPOINT = '/api/v1/funder/entities/{fundingEntityId}';
const USER_FUNDING_ENTITY_ENDPOINT = '/api/v1/funder/entities/users/{userId}';
const FUNDING_ENTITY_USERS_ENDPOINT = '/api/v1/funder/entities/{fundingEntityId}/users';

type CreateFundingEntityRequest =
  paths[typeof FUNDING_ENTITIES_LIST_ENDPOINT]['post']['requestBody']['content']['application/json'];
type UpdateFundingEntityRequest =
  paths[typeof FUNDING_ENTITY_ENDPOINT]['put']['requestBody']['content']['application/json'];

type listFundingEntitiesResponse =
  paths[typeof FUNDING_ENTITIES_LIST_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type CreateFundingEntityResponse =
  paths[typeof FUNDING_ENTITIES_LIST_ENDPOINT]['post']['responses'][200]['content']['application/json'];
type GetFundingEntityResponse =
  paths[typeof FUNDING_ENTITY_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type UpdateFundingEntityResponse =
  paths[typeof FUNDING_ENTITY_ENDPOINT]['put']['responses'][200]['content']['application/json'];
type DeleteFundingEntityResponse =
  paths[typeof FUNDING_ENTITY_ENDPOINT]['delete']['responses'][200]['content']['application/json'];
type GetUserFundingEntityResponse =
  paths[typeof USER_FUNDING_ENTITY_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type ListFundersResponse =
  paths[typeof FUNDING_ENTITY_USERS_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type InviteFunderResponse =
  paths[typeof FUNDING_ENTITY_USERS_ENDPOINT]['post']['responses'][200]['content']['application/json'];
type DeleteFundersResponse =
  paths[typeof FUNDING_ENTITY_USERS_ENDPOINT]['delete']['responses'][200]['content']['application/json'];

type UpdateFundingEntityPayload = {
  id: number;
  body: UpdateFundingEntityRequest;
};

type InviteFunderPayload = {
  email: string;
  fundingEntityId: number;
};

type DeleteFundersPayload = {
  fundingEntityId: number;
  userIds: number[];
};

export const fundingEntitiesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listFundingEntities: build.query<FundingEntity[], void>({
      query: () => FUNDING_ENTITIES_LIST_ENDPOINT,
      providesTags: (results) => [
        ...(results ? results.map((entity) => ({ type: QueryTagTypes.FundingEntities, id: entity.id })) : []),
        { type: QueryTagTypes.FundingEntities, id: 'LIST' },
      ],
      transformResponse: (response: listFundingEntitiesResponse): FundingEntity[] => response.fundingEntities,
    }),
    createFundingEntities: build.mutation<CreateFundingEntityResponse, CreateFundingEntityRequest>({
      query: (payload) => ({
        url: FUNDING_ENTITIES_LIST_ENDPOINT,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (result) => [
        ...(result ? [{ type: QueryTagTypes.FundingEntities, id: result.fundingEntity.id }] : []),
        { type: QueryTagTypes.FundingEntities, id: 'LIST' },
      ],
    }),
    getFundingEntity: build.query<FundingEntity, number>({
      query: (id) => FUNDING_ENTITY_ENDPOINT.replace('{fundingEntityId}', id.toString()),
      providesTags: (result) => (result ? [{ type: QueryTagTypes.FundingEntities, id: result.id.toString() }] : []),
      transformResponse: (response: GetFundingEntityResponse): FundingEntity => response.fundingEntity,
    }),
    updateFundingEntity: build.mutation<UpdateFundingEntityResponse, UpdateFundingEntityPayload>({
      query: (payload) => ({
        url: FUNDING_ENTITY_ENDPOINT.replace('{fundingEntityId}', payload.id.toString()),
        method: 'PUT',
        body: payload.body,
      }),
      invalidatesTags: (result, error, payload) => [
        { type: QueryTagTypes.FundingEntities, id: payload.id },
        { type: QueryTagTypes.FundingEntities, id: 'LIST' },
      ],
    }),
    deleteFundingEntity: build.mutation<DeleteFundingEntityResponse, number>({
      query: (id) => ({
        url: FUNDING_ENTITY_ENDPOINT.replace('{fundingEntityId}', id.toString()),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: QueryTagTypes.FundingEntities, id },
        { type: QueryTagTypes.FundingEntities, id: 'LIST' },
      ],
    }),
    getUserFundingEntity: build.query<FundingEntity, number>({
      query: (userId) => USER_FUNDING_ENTITY_ENDPOINT.replace('{userId}', userId.toString()),
      providesTags: (result, error, userId) => [
        ...(result ? [{ type: QueryTagTypes.FundingEntities, id: result.id.toString() }] : []),
        { type: QueryTagTypes.UserFundingEntity, userId },
      ],
      transformResponse: (response: GetUserFundingEntityResponse): FundingEntity => response.fundingEntity,
    }),
    listFundersForFundingEntity: build.query<Funder[], number>({
      query: (fundingEntityId) =>
        FUNDING_ENTITY_USERS_ENDPOINT.replace('{fundingEntityId}', fundingEntityId.toString()),
      providesTags: (results, error, fundingEntityId) => [
        { type: QueryTagTypes.Funders, id: fundingEntityId.toString() },
      ],
      transformResponse: (response: ListFundersResponse): Funder[] => response.funders,
    }),
    inviteFunder: build.mutation<InviteFunderResponse, InviteFunderPayload>({
      query: (payload) => ({
        url: FUNDING_ENTITY_USERS_ENDPOINT.replace('{fundingEntityId}', payload.fundingEntityId.toString()),
        method: 'POST',
        body: { email: payload.email },
      }),
      invalidatesTags: (result, error, payload) => [
        { type: QueryTagTypes.Funders, id: payload.fundingEntityId.toString() },
      ],
    }),
    deleteFunder: build.mutation<DeleteFundersResponse, DeleteFundersPayload>({
      query: (payload) => ({
        url: FUNDING_ENTITY_USERS_ENDPOINT.replace('{fundingEntityId}', payload.fundingEntityId.toString()),
        method: 'DELETE',
        body: { userIds: payload.userIds },
      }),
      invalidatesTags: (result, error, payload) => [
        { type: QueryTagTypes.Funders, id: payload.fundingEntityId.toString() },
      ],
    }),
  }),
});

export const {
  useListFundingEntitiesQuery,
  useCreateFundingEntitiesMutation,
  useGetFundingEntityQuery,
  useUpdateFundingEntityMutation,
  useDeleteFundingEntityMutation,
  useGetUserFundingEntityQuery,
  useLazyGetUserFundingEntityQuery,
  useListFundersForFundingEntityQuery,
  useDeleteFunderMutation,
  useInviteFunderMutation,
} = fundingEntitiesApi;
