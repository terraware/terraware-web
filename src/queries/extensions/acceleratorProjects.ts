import { api } from '../generated/acceleratorProjects';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listProjectAcceleratorDetails: {
      providesTags: [{ type: QueryTagTypes.AcceleratorProjects, id: 'LIST' }],
    },
    getProjectAcceleratorDetails: {
      providesTags: (_result, _error, projectId) => [{ type: QueryTagTypes.AcceleratorProjects, id: projectId }],
    },
    updateProjectAcceleratorDetails: {
      invalidatesTags: (_result, _error, payload) => [
        { type: QueryTagTypes.AcceleratorProjects, id: payload.projectId },
        { type: QueryTagTypes.AcceleratorProjects, id: 'LIST' },
      ],
    },
  },
});
