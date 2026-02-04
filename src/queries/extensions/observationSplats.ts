import { api } from '../generated/observationSplats';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listObservationSplats: {
      providesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.ObservationSplats, id: payload.observationId },
      ],
    },
    setObservationSplatAnnotations: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.ObservationSplats, id: payload.observationId },
      ],
    },
    generateObservationSplatFile: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.ObservationSplats, id: payload.observationId },
      ],
    },
    getObservationSplatFile: {
      providesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.ObservationMedia, id: payload.fileId },
        { type: QueryTagTypes.ObservationSplats, id: payload.fileId },
      ],
    },
    listObservationSplatAnnotations: {
      providesTags: (results) => [
        ...(results
          ? results.annotations.map((annotation) => ({
              type: QueryTagTypes.ObservationSplats,
              id: annotation.fileId,
            }))
          : []),
        { type: QueryTagTypes.ObservationSplats, id: 'LIST' },
      ],
    },
  },
});
