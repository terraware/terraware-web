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

export type InviteFunderError = 'PRE_EXISTING_USER' | 'INVALID_EMAIL';

export type InviteFunderResponse = Response & {
  email: string;
  errorDetails?: InviteFunderError;
};

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

export type InviteFunderServerResponse =
  paths[typeof FUNDING_ENTITY_USERS_ENDPOINT]['post']['responses'][200]['content']['application/json'];
export type DeleteFundersServerRequest =
  paths[typeof FUNDING_ENTITY_USERS_ENDPOINT]['delete']['requestBody']['content']['application/json'];

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

const deleteFunders = async (fundingEntityId: number, userIds: number[]): Promise<Response> => {
  const entity: DeleteFundersServerRequest = { userIds };
  return await httpFundingEntityUsers.delete({
    urlReplacements: { '{fundingEntityId}': fundingEntityId.toString() },
    entity,
  });
};

const update = async (fundingEntity: FundingEntity): Promise<Response> => {
  const entity: UpdateFundingEntityRequest = {
    name: fundingEntity.name,
    projects: fundingEntity.projects.map((project) => project.projectId),
  };
  return httpFundingEntity.put2<UpdateFundingEntityResponse>({
    urlReplacements: { '{fundingEntityId}': `${fundingEntity.id}` },
    entity,
  });
};

const create = async (fundingEntity: FundingEntity): Promise<Response2<CreateFundingEntityResponse>> => {
  const entity: CreateFundingEntityRequest = {
    name: fundingEntity.name,
    projects: fundingEntity.projects.map((project) => project.projectId),
  };
  return await httpFundingEntities.post({
    entity,
  });
};

const deleteFundingEntity = async (fundingEntityId: number): Promise<Response> => {
  return await httpFundingEntity.delete({
    urlReplacements: {
      '{fundingEntityId}': fundingEntityId.toString(),
    },
  });
};

const inviteFunder = async (fundingEntityId: number, email: string): Promise<InviteFunderResponse> => {
  const serverResponse: Response = await httpFundingEntityUsers.post({
    entity: { email: email },
    urlReplacements: {
      '{fundingEntityId}': fundingEntityId.toString(),
    },
  });

  const response: InviteFunderResponse = { ...serverResponse, email: '' };
  if (response.requestSucceeded) {
    const data: InviteFunderServerResponse = response.data;
    response.email = data?.email;
  } else {
    if (response.statusCode === 409) {
      // conflict
      response.errorDetails = 'PRE_EXISTING_USER';
    } else if (response.error === 'Field value has incorrect format: email') {
      response.errorDetails = 'INVALID_EMAIL';
    }
  }

  return response;
};

const FundingEntityService = {
  getUserFundingEntity,
  get,
  listFundingEntities,
  update,
  create,
  deleteFundingEntity,
  listFunders,
  inviteFunder,
  deleteFunders,
};

export default FundingEntityService;
