import { api } from '../generated/acceleratorProjectSpecies';
import { QueryTagTypes } from '../tags';

const listTags = [
  { type: QueryTagTypes.AcceleratorProjectSpecies, id: 'LIST' },
  { type: QueryTagTypes.Deliverables, id: 'LIST' },
];

api.enhanceEndpoints({
  endpoints: {
    getSpeciesForProject: {
      providesTags: (result, _error, projectId) => [
        { type: QueryTagTypes.AcceleratorProjectSpecies, id: 'LIST' },
        { type: QueryTagTypes.AcceleratorProjectSpecies, id: `project-${projectId}` },
        ...(result?.speciesForParticipantProjects ?? []).map((item) => ({
          type: QueryTagTypes.AcceleratorProjectSpecies,
          id: item.participantProjectSpecies.id,
        })),
      ],
    },
    getParticipantProjectSpecies: {
      providesTags: (_result, _error, participantProjectSpeciesId) => [
        { type: QueryTagTypes.AcceleratorProjectSpecies, id: participantProjectSpeciesId },
      ],
    },
    getProjectsForSpecies: {
      providesTags: (_result, _error, speciesId) => [
        { type: QueryTagTypes.AcceleratorProjectSpecies, id: 'LIST' },
        { type: QueryTagTypes.AcceleratorProjectSpecies, id: `species-${speciesId}` },
      ],
    },
    getParticipantProjectSpeciesSnapshot: {
      query: ({ projectId, deliverableId }) => ({
        url: `/api/v1/accelerator/projects/${projectId}/species/snapshots/${deliverableId}`,
        responseHandler: 'text',
      }),
      keepUnusedDataFor: 0,
    },
    createParticipantProjectSpecies: {
      invalidatesTags: listTags,
    },
    assignParticipantProjectSpecies: {
      invalidatesTags: listTags,
    },
    updateParticipantProjectSpecies: {
      invalidatesTags: (_result, _error, { participantProjectSpeciesId }) => [
        { type: QueryTagTypes.AcceleratorProjectSpecies, id: participantProjectSpeciesId },
        ...listTags,
      ],
    },
    deleteParticipantProjectSpecies: {
      invalidatesTags: listTags,
    },
  },
});
