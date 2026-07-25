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
    createProject: {
      invalidatesTags: [{ type: QueryTagTypes.Projects, id: 'LIST' }],
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
    assignProject: {
      // The assigned entities carry the project id, so their caches are stale too
      invalidatesTags: (_result, _error, payload) => [
        { type: QueryTagTypes.Projects, id: payload.id },
        { type: QueryTagTypes.Projects, id: 'LIST' },
        ...(payload.assignProjectRequestPayload.batchIds ?? []).map((batchId) => ({
          type: QueryTagTypes.Batches,
          id: batchId,
        })),
        ...(payload.assignProjectRequestPayload.batchIds?.length ? [{ type: QueryTagTypes.Batches, id: 'LIST' }] : []),
        ...(payload.assignProjectRequestPayload.accessionIds ?? []).map((accessionId) => ({
          type: QueryTagTypes.Accessions,
          id: accessionId,
        })),
        ...(payload.assignProjectRequestPayload.accessionIds?.length
          ? [{ type: QueryTagTypes.Accessions, id: 'LIST' }]
          : []),
        ...(payload.assignProjectRequestPayload.plantingSiteIds?.length ? [{ type: QueryTagTypes.PlantingSites }] : []),
      ],
    },
  },
});
