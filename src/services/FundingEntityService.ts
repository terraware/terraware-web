import { paths } from 'src/api/types/generated-schema';
import { FundingEntity } from 'src/types/FundingEntity';

import HttpService, { Response, Response2 } from './HttpService';

/**
 * Service for Funding Entity related functionality
 */

// types
export type FundingEntitiesData = {
  fundingEntities?: FundingEntity[];
};

export type FundingEntityData = {
  fundingEntity: FundingEntity | undefined;
};

export type UserFundingEntityData = {
  userFundingEntity: FundingEntity | undefined;
};

export type FundingEntitiesResponse = Response & FundingEntitiesData;
export type UserFundingEntityResponse = Response & UserFundingEntityData;
export type FundingEntityResponse = Response & FundingEntityData;

// endpoints
const FUNDING_ENTITIES_LIST_ENDPOINT = '/api/v1/funder/entities';
const FUNDING_ENTITY_ENDPOINT = '/api/v1/funder/entities/{fundingEntityId}';
const FUNDING_ENTITY_USERS_ENDPOINT = '/api/v1/funder/entities/{fundingEntityId}/users';
const USER_FUNDING_ENTITY_ENDPOINT = '/api/v1/funder/entities/users/{userId}';

type FundingEntitiesServerResponse =
  paths[typeof FUNDING_ENTITIES_LIST_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type UserFundingEntityServerResponse =
  paths[typeof USER_FUNDING_ENTITY_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type FundingEntityServerResponse =
  paths[typeof FUNDING_ENTITY_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type UpdateFundingEntityResponse =
  paths[typeof FUNDING_ENTITY_ENDPOINT]['put']['responses'][200]['content']['application/json'];
type CreateFundingEntityResponse =
  paths[typeof FUNDING_ENTITIES_LIST_ENDPOINT]['post']['responses'][200]['content']['application/json'];
type ListFundersServerResponse =
  paths[typeof FUNDING_ENTITY_USERS_ENDPOINT]['get']['responses'][200]['content']['application/json'];
export type UpdateFundingEntityRequest =
  paths[typeof FUNDING_ENTITY_ENDPOINT]['put']['requestBody']['content']['application/json'];
export type CreateFundingEntityRequest =
  paths[typeof FUNDING_ENTITIES_LIST_ENDPOINT]['post']['requestBody']['content']['application/json'];

const httpUserFundingEntity = HttpService.root(USER_FUNDING_ENTITY_ENDPOINT);
const httpFundingEntity = HttpService.root(FUNDING_ENTITY_ENDPOINT);
const httpFundingEntityUsers = HttpService.root(FUNDING_ENTITY_USERS_ENDPOINT);
const httpFundingEntities = HttpService.root(FUNDING_ENTITIES_LIST_ENDPOINT);

const getUserFundingEntity = async (userId: number): Promise<UserFundingEntityResponse> => {
  const response: UserFundingEntityResponse = await httpUserFundingEntity.get<
    UserFundingEntityServerResponse,
    UserFundingEntityData
  >(
    {
      urlReplacements: {
        '{userId}': userId.toString(),
      },
    },
    (data) => ({ userFundingEntity: data?.fundingEntity ?? undefined })
  );

  if (!response.requestSucceeded) {
    if (response.statusCode === 401) {
      response.error = 'NotAuthenticated';
    } else {
      response.error = 'GenericError';
    }
  }

  return response;
};

const get = async (fundingEntityId: number): Promise<FundingEntityResponse> => {
  const response: FundingEntityResponse = await httpFundingEntity.get<FundingEntityServerResponse, FundingEntityData>(
    {
      urlReplacements: {
        '{fundingEntityId}': fundingEntityId.toString(),
      },
    },
    (data) => ({ fundingEntity: data?.fundingEntity ?? undefined })
  );

  if (!response.requestSucceeded) {
    if (response.statusCode === 401) {
      response.error = 'NotAuthenticated';
    } else {
      response.error = 'GenericError';
    }
  }

  return response;
};

const listFundingEntities = async (): Promise<FundingEntitiesResponse> => {
  return await httpFundingEntities.get<FundingEntitiesServerResponse, FundingEntitiesData>({}, (data) => ({
    fundingEntities: data?.fundingEntities || [],
  }));
};

const listFunders = async (fundingEntityId: number): Promise<Response2<ListFundersServerResponse>> => {
  return await httpFundingEntityUsers.get2<ListFundersServerResponse>({
    urlReplacements: { '{fundingEntityId}': fundingEntityId.toString() },
  });
};

const update = async (fundingEntity: FundingEntity): Promise<Response> => {
  const entity: UpdateFundingEntityRequest = {
    name: fundingEntity.name,
    projects: fundingEntity.projects.map((project) => project.id),
  };
  return httpFundingEntity.put2<UpdateFundingEntityResponse>({
    urlReplacements: { '{fundingEntityId}': `${fundingEntity.id}` },
    entity: entity,
  });
};

const create = async (fundingEntity: FundingEntity): Promise<Response2<CreateFundingEntityResponse>> => {
  const entity: CreateFundingEntityRequest = {
    name: fundingEntity.name,
    projects: fundingEntity.projects.map((project) => project.id),
  };
  return await httpFundingEntities.post({
    entity: entity,
  });
};

const deleteFundingEntity = async (fundingEntityId: number): Promise<Response> => {
  return await httpFundingEntity.delete({
    urlReplacements: {
      '{fundingEntityId}': fundingEntityId.toString(),
    },
  });
};

const FundingEntityService = {
  getUserFundingEntity,
  get,
  listFundingEntities,
  update,
  create,
  deleteFundingEntity,
  listFunders,
};

export default FundingEntityService;
