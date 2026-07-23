import { api } from '../generated/substrata';
import { speciesCacheTags } from '../speciesCacheTags';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    updateSubstrata: {
      invalidatesTags: [{ type: QueryTagTypes.PlantingSites }],
    },
    listSubstratumSpecies1: {
      providesTags: (result) => speciesCacheTags((result?.species ?? []).map((species) => species.id)),
    },
  },
});
