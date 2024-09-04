import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response, Response2 } from 'src/services/HttpService';
import { User } from 'src/types/User';
import { InternalInterest, UserInternalInterestsData } from 'src/types/UserInternalInterests';

/**
 * Accelerator "user internal interests" related services
 */

const ENDPOINT_USER_INTERNAL_INTERESTS = '/api/v1/users/{userId}/internalInterests';

export type GetUserInternalInterestsResponsePayload =
  paths[typeof ENDPOINT_USER_INTERNAL_INTERESTS]['get']['responses'][200]['content']['application/json'];
export type UpdateUserInternalInterestsRequestPayload =
  paths[typeof ENDPOINT_USER_INTERNAL_INTERESTS]['put']['requestBody']['content']['application/json'];
export type UpdateUserInternalInterestsResponsePayload =
  paths[typeof ENDPOINT_USER_INTERNAL_INTERESTS]['put']['responses'][200]['content']['application/json'];

const httpUserInternalInterests = HttpService.root(ENDPOINT_USER_INTERNAL_INTERESTS);

const get = async (userId: number): Promise<Response2<UserInternalInterestsData>> => {
  return await httpUserInternalInterests.get2<GetUserInternalInterestsResponsePayload>({
    urlReplacements: { '{userId}': `${userId}` },
  });
};

const update = async (user: User, internalInterests: InternalInterest[]): Promise<Response> => {
  const entity: UpdateUserInternalInterestsRequestPayload = { internalInterests };

  return httpUserInternalInterests.put2<UpdateUserInternalInterestsResponsePayload>({
    urlReplacements: { '{userId}': `${user.id}` },
    entity,
  });
};

const UserDeliverableCategoriesService = {
  get,
  update,
};

export default UserDeliverableCategoriesService;
