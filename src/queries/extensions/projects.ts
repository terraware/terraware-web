import { api } from '../generated/projects';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getProject: {
      providesTags: (_result, _error, projectId) => [{ type: QueryTagTypes.Projects, id: projectId }],
    },
  },
});
