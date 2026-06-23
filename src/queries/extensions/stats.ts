import { api } from '../generated/stats';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getAggregatedTrackingStats: {
      providesTags: (_result, _error, { organizationId, projectId }) => [
        {
          type: QueryTagTypes.TrackingStats,
          id: projectId ?? organizationId ?? 'LIST',
        },
      ],
    },
  },
});
