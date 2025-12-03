import { api } from '../generated/draftPlantingSites';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    createDraftPlantingSite: {
      invalidatesTags: (result) => [
        ...(result ? [{ type: QueryTagTypes.draftPlantingSites, id: result.id }] : []),
        { type: QueryTagTypes.draftPlantingSites, id: 'LIST' },
      ],
    },
    deleteDraftPlantingSite: {
      invalidatesTags: (_result, _error, draftSiteId) => [
        { type: QueryTagTypes.draftPlantingSites, id: draftSiteId },
        { type: QueryTagTypes.draftPlantingSites, id: 'LIST' },
      ],
    },
    getDraftPlantingSite: {
      providesTags: (_result, _error, plantingSiteId) => [{ type: QueryTagTypes.PlantingSites, id: plantingSiteId }],
    },
    updateDraftPlantingSite: {
      invalidatesTags: (_result, _error, plantingSiteId) => [
        { type: QueryTagTypes.PlantingSites, id: plantingSiteId.id },
        { type: QueryTagTypes.PlantingSites, id: 'LIST' },
      ],
    },
  },
});
