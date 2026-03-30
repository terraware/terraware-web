import { api } from '../generated/substrata';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    updateSubstrata: {
      invalidatesTags: [{ type: QueryTagTypes.PlantingSites }],
    },
  },
});
