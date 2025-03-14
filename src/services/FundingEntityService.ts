import { paths } from 'src/api/types/generated-schema';
import { FundingEntity } from 'src/types/FundingEntity';

import { SearchNodePayload, SearchSortOrder } from '../types/Search';
import { SearchOrderConfig, searchAndSort } from '../utils/searchAndSort';
import HttpService, { Response } from './HttpService';

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

export type FundingEntitiesResponse = Response & FundingEntitiesData;

export type UserFundingEntityResponse = Response & FundingEntityData;

// endpoints
const FUNDING_ENTITIES_LIST_ENDPOINT = '/api/v1/funder/entities';
const USER_FUNDING_ENTITY_ENDPOINT = '/api/v1/funder/entities/users/{userId}';

type FundingEntitiesServerResponse =
  paths[typeof FUNDING_ENTITIES_LIST_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type UserFundingEntityServerResponse =
  paths[typeof USER_FUNDING_ENTITY_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const httpUserFundingEntity = HttpService.root(USER_FUNDING_ENTITY_ENDPOINT);
const httpUserFundingEntities = HttpService.root(FUNDING_ENTITIES_LIST_ENDPOINT);

const getUserFundingEntity = async (userId: number): Promise<UserFundingEntityResponse> => {
  const response: UserFundingEntityResponse = await httpUserFundingEntity.get<
    UserFundingEntityServerResponse,
    FundingEntityData
  >(
    {
      urlReplacements: {
        '{userId}': userId.toString(),
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

const listFundingEntities = async (
  locale: string | null,
  search?: SearchNodePayload,
  searchSortOrder?: SearchSortOrder
): Promise<FundingEntitiesResponse> => {
  let searchOrderConfig: SearchOrderConfig | undefined;
  if (searchSortOrder) {
    searchOrderConfig = {
      locale,
      sortOrder: searchSortOrder,
      numberFields: ['id'],
    };
  }

  return await httpUserFundingEntities.get<FundingEntitiesServerResponse, FundingEntitiesData>({}, (data) => ({
    fundingEntities: searchAndSort(data?.fundingEntities || [], search, searchOrderConfig),
  }));
};

const FundingEntityService = {
  getUserFundingEntity,
  listFundingEntities,
};

export default FundingEntityService;
