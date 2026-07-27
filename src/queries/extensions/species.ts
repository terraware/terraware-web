import { api } from '../generated/species';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listSpecies: {
      // Species data is long-lived and referenced across the whole app; keep it cached for the
      // session (the SpeciesProvider used to hold it indefinitely). Tag invalidation still refreshes
      // it on create/update/delete.
      keepUnusedDataFor: Infinity,
      providesTags: (result) => [
        ...(result ? result.species.map((species) => ({ type: QueryTagTypes.Species, id: species.id })) : []),
        { type: QueryTagTypes.Species, id: 'LIST' },
      ],
    },
    getSpecies: {
      keepUnusedDataFor: Infinity,
      providesTags: (_result, _error, arg) => [{ type: QueryTagTypes.Species, id: arg.speciesId }],
    },
    createSpecies: {
      invalidatesTags: [{ type: QueryTagTypes.Species, id: 'LIST' }],
    },
    updateSpecies: {
      invalidatesTags: (_result, _error, arg) => [
        { type: QueryTagTypes.Species, id: arg.speciesId },
        { type: QueryTagTypes.Species, id: 'LIST' },
      ],
    },
    deleteSpecies: {
      invalidatesTags: (_result, _error, speciesId) => [
        { type: QueryTagTypes.Species, id: speciesId },
        { type: QueryTagTypes.Species, id: 'LIST' },
      ],
    },
    resolveSpeciesListUpload: {
      invalidatesTags: [{ type: QueryTagTypes.Species, id: 'LIST' }],
    },
    acceptProblemSuggestion: {
      // Accepting a suggestion rewrites the species' scientific name.
      invalidatesTags: [{ type: QueryTagTypes.Species, id: 'LIST' }],
    },
  },
});
