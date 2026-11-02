import { OrganizationRole } from 'src/types/Organization';
import { OrNodePayload, SearchNodePayload, SearchResponseElement } from 'src/types/Search';
import { OrganizationUser } from 'src/types/User';
import { parseSearchTerm } from 'src/utils/search';

import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

export type ProjectInternalUserRoleSearchResult = {
  project_name: string;
  role: string;
  user_id: string;
};

type SearchOrganizationUsersApiArg = {
  organizationId: number;
  searchTerm: string;
};

type SearchProjectInternalUserRolesApiArg = {
  organizationId: number;
  roles: string[];
};

const buildOrganizationUserSearch = ({ organizationId, searchTerm }: SearchOrganizationUsersApiArg) => {
  const children: SearchNodePayload[] = [
    { operation: 'field', field: 'organization_id', type: 'Exact', values: [organizationId.toString()] },
  ];

  if (searchTerm) {
    const { type, values } = parseSearchTerm(searchTerm);
    const searchField: OrNodePayload = {
      operation: 'or',
      children: [
        { operation: 'field', field: 'user_firstName', type, values },
        { operation: 'field', field: 'user_lastName', type, values },
        { operation: 'field', field: 'user_email', type: 'Exact', values },
      ],
    };
    children.push(searchField);
  }

  return { operation: 'and', children } as SearchNodePayload;
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    searchOrganizationUsers: build.query<OrganizationUser[], SearchOrganizationUsersApiArg>({
      query: (arg) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'organizationUsers',
          fields: ['user_id', 'user_firstName', 'user_lastName', 'user_email', 'roleName', 'createdTime'],
          search: buildOrganizationUserSearch(arg),
          sortOrder: [{ field: 'user_email' }],
          count: 0,
        },
      }),
      providesTags: (_result, _error, { organizationId }) => [
        { type: QueryTagTypes.OrganizationUsers, id: organizationId },
      ],
      transformResponse: (response: { results: SearchResponseElement[] }): OrganizationUser[] =>
        response.results.map((result) => ({
          firstName: result.user_firstName as string,
          lastName: result.user_lastName as string,
          email: result.user_email as string,
          id: result.user_id as number,
          role: result.roleName as OrganizationRole,
          addedTime: result.createdTime as string,
        })),
    }),
    searchProjectInternalUserRoles: build.query<
      ProjectInternalUserRoleSearchResult[],
      SearchProjectInternalUserRolesApiArg
    >({
      query: ({ organizationId, roles }) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'projectInternalUsers',
          fields: ['project_name', 'user_id', 'role'],
          search: {
            operation: 'and',
            children: [
              {
                operation: 'field',
                field: 'project_organization_id',
                type: 'Exact',
                values: [organizationId.toString()],
              },
              { operation: 'field', field: 'role', type: 'Exact', values: roles },
            ],
          },
          sortOrder: [{ field: 'role' }],
          count: 0,
        },
      }),
      providesTags: [{ type: QueryTagTypes.ProjectInternalUsers, id: 'LIST' }],
      transformResponse: (response: { results: ProjectInternalUserRoleSearchResult[] }) => response.results,
    }),
  }),
});

export const { useLazySearchOrganizationUsersQuery, useLazySearchProjectInternalUserRolesQuery } = injectedRtkApi;
