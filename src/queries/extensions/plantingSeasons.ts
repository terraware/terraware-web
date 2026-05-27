import { api } from '../generated/plantingSeasons';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listPlantingSeasons: {
      providesTags: [{ type: QueryTagTypes.PlantingSeasons, id: 'LIST' }],
    },
    createPlantingSeason: {
      invalidatesTags: [{ type: QueryTagTypes.PlantingSeasons, id: 'LIST' }],
    },
  },
});
