import { api } from '../generated/projectInternalUsers';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getInternalUsers: {
      providesTags: (_result, _error, projectId) => [{ type: QueryTagTypes.ProjectInternalUsers, id: projectId }],
    },
    updateInternalUser: {
      invalidatesTags: (_result, _error, payload) => [{ type: QueryTagTypes.ProjectInternalUsers, id: payload.id }],
    },
  },
});
