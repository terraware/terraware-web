import { api } from '../generated/organizationUsers';
import { QueryTagTypes } from '../tags';

const organizationUserWriteTags = (organizationId: number) => [
  { type: QueryTagTypes.OrganizationUsers, id: organizationId },
  { type: QueryTagTypes.OrganizationRoles, id: organizationId },
  { type: QueryTagTypes.Organizations, id: organizationId },
];

api.enhanceEndpoints({
  endpoints: {
    listOrganizationUsers: {
      providesTags: (_result, _error, arg) => [{ type: QueryTagTypes.OrganizationUsers, id: arg }],
    },
    getOrganizationUser: {
      providesTags: (_result, _error, arg) => [{ type: QueryTagTypes.OrganizationUsers, id: arg.organizationId }],
    },
    addOrganizationUser: {
      invalidatesTags: (_result, _error, arg) => organizationUserWriteTags(arg.organizationId),
    },
    updateOrganizationUser: {
      invalidatesTags: (_result, _error, arg) => organizationUserWriteTags(arg.organizationId),
    },
    deleteOrganizationUser: {
      invalidatesTags: (_result, _error, arg) => organizationUserWriteTags(arg.organizationId),
    },
  },
});
