import { api } from '../generated/funderProjects';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getAllProjects: {
      providesTags: [{ type: QueryTagTypes.FunderProjects, id: 'LIST' }],
    },
    getProjects: {
      providesTags: (result) => [
        ...(result?.projects.map((project) => ({ type: QueryTagTypes.FunderProjects, id: project.projectId })) ?? []),
        { type: QueryTagTypes.FunderProjects, id: 'LIST' },
      ],
    },
    publishProjectProfile: {
      invalidatesTags: (_result, _error, payload) => [
        { type: QueryTagTypes.FunderProjects, id: payload.projectId },
        { type: QueryTagTypes.FunderProjects, id: 'LIST' },
      ],
    },
  },
});
