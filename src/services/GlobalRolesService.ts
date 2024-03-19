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

export type GlobalRoleUsersListResponsePayload =
  paths[typeof ENDPOINT_GLOBAL_ROLES_USERS]['get']['responses'][200]['content']['application/json'];

export type UpdateGlobalRolesRequestPayload =
  paths[typeof ENDPOINT_USER_GLOBAL_ROLES]['post']['requestBody']['content']['application/json'];
export type UpdateGlobalRolesResponsePayload =
  paths[typeof ENDPOINT_USER_GLOBAL_ROLES]['post']['responses'][200]['content']['application/json'];

export type DeleteGlobalRolesRequestPayload =
  paths[typeof ENDPOINT_GLOBAL_ROLES_USERS]['delete']['requestBody']['content']['application/json'];
export type DeleteGlobalRolesResponsePayload =
  paths[typeof ENDPOINT_GLOBAL_ROLES_USERS]['delete']['responses'][200]['content']['application/json'];

const httpGlobalRolesUsers = HttpService.root(ENDPOINT_GLOBAL_ROLES_USERS);
const httpUserGlobalRoles = HttpService.root(ENDPOINT_USER_GLOBAL_ROLES);

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

const deleteRoles = async (users: User[]): Promise<Response> => {
  const payload: DeleteGlobalRolesRequestPayload = {
    userIds: users.map((user) => user.id),
  };

  return httpGlobalRolesUsers.delete2<DeleteGlobalRolesResponsePayload>({
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
  deleteRoles,
  list,
  update,
};

export default GlobalRolesService;
