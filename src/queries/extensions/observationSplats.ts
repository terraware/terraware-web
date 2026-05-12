import { api } from '../generated/observationSplats';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listObservationSplats: {
      providesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Splats, id: payload.observationId }],
    },
    setObservationSplatAnnotations: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Splats, id: payload.fileId }],
    },
    setObservationSplatNeedsAttention: {
      invalidatesTags: [{ type: QueryTagTypes.Splats, id: 'LIST' }],
    },
    generateObservationSplatFile: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Splats, id: payload.observationId }],
    },
    getObservationSplatFile: {
      providesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Splats, id: payload.fileId }],
    },
    listSplatDetails: {
      providesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Splats, id: payload.fileId }],
    },
    deleteObservationSplat: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.Splats, id: payload.fileId },
        { type: QueryTagTypes.Splats, id: 'LIST' },
      ],
    },
  },
});
