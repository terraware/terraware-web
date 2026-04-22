import { api } from '../generated/organizationMedia';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    deleteOrganizationMediaFile: {
      invalidatesTags: [{ type: QueryTagTypes.OrganizationMedia, id: 'LIST' }],
    },
  },
});
