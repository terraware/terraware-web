import { api } from '../generated/plantingSites';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listPlantingSites: {
      providesTags: (results) => [
        ...(results ? results.sites.map((site) => ({ type: QueryTagTypes.PlantingSites, id: site.id })) : []),
        { type: QueryTagTypes.PlantingSites, id: 'LIST' },
      ],
    },
    createPlantingSite: {
      invalidatesTags: (result) => [
        ...(result ? [{ type: QueryTagTypes.PlantingSites, id: result.id }] : []),
        { type: QueryTagTypes.PlantingSites, id: 'LIST' },
      ],
    },
    listPlantingSiteReportedPlants: {
      providesTags: (results) => [
        ...(results ? results.sites.map((site) => ({ type: QueryTagTypes.PlantingSites, id: site.id })) : []),
        { type: QueryTagTypes.PlantingSites, id: 'LIST' },
      ],
    },
    deletePlantingSite: {
      invalidatesTags: (_result, _error, plantingSiteId) => [
        { type: QueryTagTypes.PlantingSites, id: plantingSiteId },
        { type: QueryTagTypes.PlantingSites, id: 'LIST' },
      ],
    },
    getPlantingSite: {
      providesTags: (_result, _error, plantingSiteId) => [{ type: QueryTagTypes.PlantingSites, id: plantingSiteId }],
    },
    updatePlantingSite: {
      invalidatesTags: (_result, _error, plantingSiteId) => [
        { type: QueryTagTypes.PlantingSites, id: plantingSiteId.id },
        { type: QueryTagTypes.PlantingSites, id: 'LIST' },
      ],
    },
    listPlantingSiteHistories: {
      providesTags: (_result, _error, plantingSiteId) => [{ type: QueryTagTypes.PlantingSites, id: plantingSiteId }],
    },
    getPlantingSiteHistory: {
      providesTags: (_result, _error, payload) => [{ type: QueryTagTypes.PlantingSites, id: payload.id }],
    },
    getPlantingSiteReportedPlants: {
      providesTags: (_result, _error, plantingSiteId) => [{ type: QueryTagTypes.PlantingSites, id: plantingSiteId }],
    },
  },
});
