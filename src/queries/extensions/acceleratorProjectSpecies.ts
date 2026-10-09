import { api } from '../generated/acceleratorProjectSpecies';
import { QueryTagTypes } from '../tags';

// A species' review status rolls up into its deliverable. The writes don't know which deliverable that is, and
// getDeliverable only provides its per-submission tag, so every deliverable query is invalidated.
const deliverablesTag = QueryTagTypes.Deliverables;

api.enhanceEndpoints({
  endpoints: {
    getSpeciesForProject: {
      providesTags: (result, _error, projectId) => [
        { type: QueryTagTypes.AcceleratorSpeciesByProject, id: projectId },
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
      providesTags: (result, _error, speciesId) => [
        { type: QueryTagTypes.AcceleratorProjectsBySpecies, id: speciesId },
        ...(result?.participantProjectsForSpecies ?? []).map((item) => ({
          type: QueryTagTypes.AcceleratorProjectSpecies,
          id: item.participantProjectSpeciesId,
        })),
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
      invalidatesTags: (_result, _error, { projectId, speciesId }) => [
        { type: QueryTagTypes.AcceleratorSpeciesByProject, id: projectId },
        { type: QueryTagTypes.AcceleratorProjectsBySpecies, id: speciesId },
        deliverablesTag,
      ],
    },
    assignParticipantProjectSpecies: {
      invalidatesTags: (_result, _error, { projectIds, speciesIds }) => [
        ...projectIds.map((id) => ({ type: QueryTagTypes.AcceleratorSpeciesByProject, id })),
        ...speciesIds.map((id) => ({ type: QueryTagTypes.AcceleratorProjectsBySpecies, id })),
        deliverablesTag,
      ],
    },
    updateParticipantProjectSpecies: {
      invalidatesTags: (_result, _error, { participantProjectSpeciesId }) => [
        { type: QueryTagTypes.AcceleratorProjectSpecies, id: participantProjectSpeciesId },
        deliverablesTag,
      ],
    },
    deleteParticipantProjectSpecies: {
      invalidatesTags: [
        QueryTagTypes.AcceleratorSpeciesByProject,
        QueryTagTypes.AcceleratorProjectsBySpecies,
        deliverablesTag,
      ],
    },
  },
});
