import { paths } from 'src/api/types/generated-schema';
import HttpService, { Params, Response } from 'src/services/HttpService';
import { GlobalRolesUsersData, UserWithGlobalRoles } from 'src/types/GlobalRoles';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { UserGlobalRole } from 'src/types/User';
import { SearchOrderConfig, searchAndSort } from 'src/utils/searchAndSort';

/**
 * Accelerator "globalRole" related services
 */

const ENDPOINT_GLOBAL_ROLES_USERS = '/api/v1/globalRoles/users';
const ENDPOINT_GLOBAL_ROLES_USER = '/api/v1/users/{userId}/globalRoles';

export type GlobalRoleUsersListResponsePayload =
  paths[typeof ENDPOINT_GLOBAL_ROLES_USERS]['get']['responses'][200]['content']['application/json'];

export type UpdateGlobalRolesRequestPayload =
  paths[typeof ENDPOINT_GLOBAL_ROLES_USER]['post']['requestBody']['content']['application/json'];
export type UpdateGlobalRolesResponsePayload =
  paths[typeof ENDPOINT_GLOBAL_ROLES_USER]['post']['responses'][200]['content']['application/json'];

const httpGlobalRolesUsers = HttpService.root(ENDPOINT_GLOBAL_ROLES_USERS);
const httpGlobalRolesUser = HttpService.root(ENDPOINT_GLOBAL_ROLES_USER);

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

const update = async (user: UserWithGlobalRoles, globalRoles: UserGlobalRole[]): Promise<Response> => {
  const payload: UpdateGlobalRolesRequestPayload = {
    globalRoles,
  };

  return httpGlobalRolesUser.post2<UpdateGlobalRolesResponsePayload>({
    urlReplacements: {
      '{userId}': `${user.id}`,
    },
    entity: payload,
  });
};

const GlobalRolesService = {
  list,
  update,
};

export default GlobalRolesService;
