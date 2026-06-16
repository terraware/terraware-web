import { api } from '../generated/projects';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listProjects: {
      providesTags: (results) => [
        ...(results ? results.projects.map((project) => ({ type: QueryTagTypes.Projects, id: project.id })) : []),
        { type: QueryTagTypes.Projects, id: 'LIST' },
      ],
    },
    getProject: {
      providesTags: (_result, _error, projectId) => [{ type: QueryTagTypes.Projects, id: projectId }],
    },
    updateProject: {
      invalidatesTags: (_result, _error, payload) => [
        { type: QueryTagTypes.Projects, id: payload.id },
        { type: QueryTagTypes.Projects, id: 'LIST' },
      ],
    },
    deleteProject: {
      invalidatesTags: (_result, _error, projectId) => [
        { type: QueryTagTypes.Projects, id: projectId },
        { type: QueryTagTypes.Projects, id: 'LIST' },
      ],
    },
  },
});
