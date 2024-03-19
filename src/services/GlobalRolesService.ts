import { paths } from 'src/api/types/generated-schema';
import HttpService, { Params, Response } from 'src/services/HttpService';
import { GlobalRolesUsersData, UserWithGlobalRoles } from 'src/types/GlobalRoles';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { User, UserGlobalRole } from 'src/types/User';
import { SearchOrderConfig, searchAndSort } from 'src/utils/searchAndSort';

/**
 * Accelerator "globalRole" related services
 */

const ENDPOINT_GLOBAL_ROLES_USERS = '/api/v1/globalRoles/users';
const ENDPOINT_USER_GLOBAL_ROLES = '/api/v1/users/{userId}/globalRoles';
const ENDPOINT_USERS_GLOBAL_ROLES = '/api/v1/users/globalRoles';

export type GlobalRoleUsersListResponsePayload =
  paths[typeof ENDPOINT_GLOBAL_ROLES_USERS]['get']['responses'][200]['content']['application/json'];

export type UpdateGlobalRolesRequestPayload =
  paths[typeof ENDPOINT_USER_GLOBAL_ROLES]['post']['requestBody']['content']['application/json'];
export type UpdateGlobalRolesResponsePayload =
  paths[typeof ENDPOINT_USER_GLOBAL_ROLES]['post']['responses'][200]['content']['application/json'];

export type RemoveGlobalRolesRequestPayload =
  paths[typeof ENDPOINT_USERS_GLOBAL_ROLES]['delete']['requestBody']['content']['application/json'];
export type RemoveGlobalRolesResponsePayload =
  paths[typeof ENDPOINT_USERS_GLOBAL_ROLES]['delete']['responses'][200]['content']['application/json'];

const httpGlobalRolesUsers = HttpService.root(ENDPOINT_GLOBAL_ROLES_USERS);
const httpUserGlobalRoles = HttpService.root(ENDPOINT_USER_GLOBAL_ROLES);
const httpUsersGlobalRoles = HttpService.root(ENDPOINT_USERS_GLOBAL_ROLES);

export type UserWithGlobalRolesData = {
  user: UserWithGlobalRoles;
};

const list = async (
  locale: string | null,
  search?: SearchNodePayload,
  searchSortOrder?: SearchSortOrder
): Promise<(GlobalRolesUsersData & Response) | null> => {
  let searchOrderConfig: SearchOrderConfig;
  if (searchSortOrder) {
    searchOrderConfig = {
      locale,
      sortOrder: searchSortOrder,
      numberFields: ['id'],
    };
  }

  return httpGlobalRolesUsers.get<GlobalRoleUsersListResponsePayload, GlobalRolesUsersData>(
    {
      params: {} as Params,
    },
    (data) => ({
      users: searchAndSort(data?.users || [], search, searchOrderConfig),
    })
  );
};

const remove = async (users: User[]): Promise<Response> => {
  const payload: RemoveGlobalRolesRequestPayload = {
    userIds: users.map((user) => user.id),
  };

  return httpUsersGlobalRoles.delete2<RemoveGlobalRolesResponsePayload>({
    entity: payload,
  });
};

const update = async (user: User, globalRoles: UserGlobalRole[]): Promise<Response> => {
  const payload: UpdateGlobalRolesRequestPayload = {
    globalRoles,
  };

  return httpUserGlobalRoles.post2<UpdateGlobalRolesResponsePayload>({
    urlReplacements: {
      '{userId}': `${user.id}`,
    },
    entity: payload,
  });
};

const GlobalRolesService = {
  list,
  remove,
  update,
};

export default GlobalRolesService;
