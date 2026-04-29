import { api } from '../generated/organizationSplats';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    generateOrganizationSplat: {
      invalidatesTags: [{ type: QueryTagTypes.Splats, id: 'LIST' }],
    },
    setOrganizationSplatNeedsAttention: {
      invalidatesTags: [{ type: QueryTagTypes.Splats, id: 'LIST' }],
    },
  },
});
