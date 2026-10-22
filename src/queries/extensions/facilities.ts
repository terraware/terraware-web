import { api } from '../generated/facilities';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    createFacility: {
      invalidatesTags: [{ type: QueryTagTypes.Organizations, id: 'LIST' }],
    },
    updateFacility: {
      invalidatesTags: [{ type: QueryTagTypes.Organizations, id: 'LIST' }],
    },
  },
});
