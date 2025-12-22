import { api } from '../generated/t0';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getAllT0SiteDataSet: {
      providesTags: (_result, _error, plantingSiteId) => [{ type: QueryTagTypes.T0, id: plantingSiteId }],
    },
    getT0SiteData: {
      providesTags: (_result, _error, plantingSiteId) => [{ type: QueryTagTypes.T0, id: plantingSiteId }],
    },
    getT0SpeciesForPlantingSite: {
      providesTags: (_result, _error, plantingSiteId) => [{ type: QueryTagTypes.T0, id: plantingSiteId }],
    },
    assignT0SiteData: {
      invalidatesTags: (_result, _error, payload) => [{ type: QueryTagTypes.T0, id: payload.plantingSiteId }],
    },
    assignT0TempSiteData: {
      invalidatesTags: (_result, _error, payload) => [{ type: QueryTagTypes.T0, id: payload.plantingSiteId }],
    },
  },
});
