import { api } from '../generated/draftPlantingSites';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    createDraftPlantingSite: {
      invalidatesTags: (result) => [
        ...(result ? [{ type: QueryTagTypes.DraftPlantingSites, id: result.id }] : []),
        { type: QueryTagTypes.DraftPlantingSites, id: 'LIST' },
      ],
    },
    deleteDraftPlantingSite: {
      invalidatesTags: (_result, _error, draftSiteId) => [
        { type: QueryTagTypes.DraftPlantingSites, id: draftSiteId },
        { type: QueryTagTypes.DraftPlantingSites, id: 'LIST' },
      ],
    },
    getDraftPlantingSite: {
      providesTags: (_result, _error, plantingSiteId) => [
        { type: QueryTagTypes.DraftPlantingSites, id: plantingSiteId },
      ],
    },
    updateDraftPlantingSite: {
      invalidatesTags: (_result, _error, plantingSiteId) => [
        { type: QueryTagTypes.DraftPlantingSites, id: plantingSiteId.id },
        { type: QueryTagTypes.DraftPlantingSites, id: 'LIST' },
      ],
    },
  },
});
