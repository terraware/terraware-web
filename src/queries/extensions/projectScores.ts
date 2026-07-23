import { api } from '../generated/projectScores';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getProjectOverallScore: {
      providesTags: (_result, _error, projectId) => [{ type: QueryTagTypes.ProjectScores, id: projectId }],
    },
    upsertProjectScores: {
      invalidatesTags: (_result, _error, payload) => [{ type: QueryTagTypes.ProjectScores, id: payload.projectId }],
    },
  },
});
