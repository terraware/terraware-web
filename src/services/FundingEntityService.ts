import { paths } from 'src/api/types/generated-schema';
import { FundingEntity } from 'src/types/FundingEntity';

import HttpService, { Response } from './HttpService';

/**
 * Service for Funding Entity related functionality
 */

// types
export type FundingEntityData = {
  fundingEntity: FundingEntity | undefined;
};

export type UserFundingEntityResponse = Response & FundingEntityData;

// endpoints
const USER_FUNDING_ENTITY_ENDPOINT = '/api/v1/funder/entities/users/{userId}';

type UserFundingEntityServerResponse =
  paths[typeof USER_FUNDING_ENTITY_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const httpUserFundingEntity = HttpService.root(USER_FUNDING_ENTITY_ENDPOINT);

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

const FundingEntityService = {
  getUserFundingEntity,
};

export default FundingEntityService;
