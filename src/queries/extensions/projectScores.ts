import { api } from '../generated/projectScores';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getProjectOverallScore: {
      providesTags: (_result, _error, projectId) => [{ type: QueryTagTypes.Scores, id: projectId }],
    },
    upsertProjectScores: {
      invalidatesTags: (_result, _error, payload) => [{ type: QueryTagTypes.Scores, id: payload.projectId }],
    },
  },
});
