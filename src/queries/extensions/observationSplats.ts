import { api } from '../generated/observationSplats';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listObservationSplats: {
      providesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.ObservationSplats, observationId: payload.observationId },
      ],
    },
    generateObservationSplatFile: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.ObservationSplats, observationId: payload.observationId },
      ],
    },
    getObservationSplatFile: {
      providesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.ObservationMedia, fileId: payload.fileId },
        { type: QueryTagTypes.ObservationSplats, fileId: payload.fileId },
      ],
    },
    listObservationSplatAnnotations: {
      providesTags: (results) => [
        ...(results
          ? results.annotations.map((annotation) => ({
              type: QueryTagTypes.ObservationSplats,
              fileId: annotation.fileId,
            }))
          : []),
        { type: QueryTagTypes.ObservationSplats, id: 'LIST' },
      ],
    },
  },
});
