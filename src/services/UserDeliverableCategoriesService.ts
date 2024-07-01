import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from 'src/services/HttpService';
import { DeliverableCategoryType } from 'src/types/Deliverables';
import { User } from 'src/types/User';
import { UserDeliverableCategoriesData } from 'src/types/UserDeliverableCategories';

/**
 * Accelerator "user deliverable category" related services
 */

const ENDPOINT_USER_DELIVERABLE_CATEGORIES = '/api/v1/users/{userId}/deliverableCategories';

export type GetUserDeliverableCategoriesResponsePayload =
  paths[typeof ENDPOINT_USER_DELIVERABLE_CATEGORIES]['get']['responses'][200]['content']['application/json'];
export type UpdateUserDeliverableCategoriesRequestPayload =
  paths[typeof ENDPOINT_USER_DELIVERABLE_CATEGORIES]['put']['requestBody']['content']['application/json'];
export type UpdateUserDeliverableCategoriesResponsePayload =
  paths[typeof ENDPOINT_USER_DELIVERABLE_CATEGORIES]['put']['responses'][200]['content']['application/json'];

const httpUserDeliverableCategories = HttpService.root(ENDPOINT_USER_DELIVERABLE_CATEGORIES);

const get = async (userId: number): Promise<Response & UserDeliverableCategoriesData> => {
  return httpUserDeliverableCategories.get<GetUserDeliverableCategoriesResponsePayload, UserDeliverableCategoriesData>(
    {
      urlReplacements: { '{userId}': `${userId}` },
    },
    (data) => {
      return { deliverableCategories: data?.deliverableCategories || [] };
    }
  );
};

const update = async (user: User, deliverableCategories: DeliverableCategoryType[]): Promise<Response> => {
  const entity: UpdateUserDeliverableCategoriesRequestPayload = { deliverableCategories };

  return httpUserDeliverableCategories.put2<UpdateUserDeliverableCategoriesResponsePayload>({
    urlReplacements: { '{userId}': `${user.id}` },
    entity,
  });
};

const UserDeliverableCategoriesService = {
  get,
  update,
};

export default UserDeliverableCategoriesService;
