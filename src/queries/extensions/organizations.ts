import { api } from '../generated/organizations';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listOrganizations: {
      providesTags: (result) => [
        { type: QueryTagTypes.Organizations, id: 'LIST' },
        ...(result?.organizations ?? []).map((organization) => ({
          type: QueryTagTypes.Organizations,
          id: organization.id,
        })),
      ],
    },
    getOrganization: {
      providesTags: (_result, _error, arg) => [{ type: QueryTagTypes.Organizations, id: arg.organizationId }],
    },
    createOrganization: {
      invalidatesTags: [{ type: QueryTagTypes.Organizations, id: 'LIST' }],
    },
    updateOrganization: {
      invalidatesTags: (_result, _error, arg) => [{ type: QueryTagTypes.Organizations, id: arg.organizationId }],
    },
    deleteOrganization: {
      invalidatesTags: [{ type: QueryTagTypes.Organizations, id: 'LIST' }],
    },
    listOrganizationRoles: {
      providesTags: (_result, _error, arg) => [{ type: QueryTagTypes.OrganizationRoles, id: arg }],
    },
  },
});
