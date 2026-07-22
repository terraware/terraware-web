import { api } from '../generated/projectVotes';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getProjectVotes: {
      providesTags: (_result, _error, projectId) => [{ type: QueryTagTypes.ProjectVotes, id: projectId }],
    },
    upsertProjectVotes: {
      invalidatesTags: (_result, _error, payload) => [{ type: QueryTagTypes.ProjectVotes, id: payload.projectId }],
    },
    deleteProjectVotes: {
      invalidatesTags: (_result, _error, payload) => [{ type: QueryTagTypes.ProjectVotes, id: payload.projectId }],
    },
  },
});
