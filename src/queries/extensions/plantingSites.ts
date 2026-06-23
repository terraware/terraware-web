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
      providesTags: (_result, _error, siteApiArg) => [{ type: QueryTagTypes.PlantingSites, id: siteApiArg.id }],
    },
    updatePlantingSite: {
      invalidatesTags: (_result, _error, siteApiArg) => [
        { type: QueryTagTypes.PlantingSites, id: siteApiArg.id },
        { type: QueryTagTypes.PlantingSites, id: 'LIST' },
        // this mutation is called to change the survivalRateIncludesTempPlots, which is included in the T0 response for a site
        { type: QueryTagTypes.T0, id: siteApiArg.id },
        { type: QueryTagTypes.TrackingStats },
      ],
    },
    getPlantingSiteHistory: {
      providesTags: (_result, _error, payload) => [{ type: QueryTagTypes.PlantingSites, id: payload.id }],
    },
    getPlantingSiteReportedPlants: {
      providesTags: (_result, _error, plantingSiteId) => [{ type: QueryTagTypes.PlantingSites, id: plantingSiteId }],
    },
  },
});
