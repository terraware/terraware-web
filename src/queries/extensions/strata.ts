import { api } from '../generated/strata';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    updateStratum: {
      invalidatesTags: [{ type: QueryTagTypes.PlantingSites }],
    },
  },
});
