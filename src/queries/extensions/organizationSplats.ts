import { api } from '../generated/organizationSplats';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    generateOrganizationSplat: {
      invalidatesTags: [{ type: QueryTagTypes.OrganizationMedia, id: 'LIST' }],
    },
  },
});
