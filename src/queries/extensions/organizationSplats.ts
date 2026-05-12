import { api } from '../generated/organizationSplats';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    generateOrganizationSplat: {
      invalidatesTags: [{ type: QueryTagTypes.Splats, id: 'LIST' }],
    },
    deleteOrganizationSplat: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.Splats, id: payload.fileId },
        { type: QueryTagTypes.Splats, id: 'LIST' },
      ],
    },
    getOrganizationSplatFile: {
      providesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Splats, id: payload.fileId }],
    },
    setOrganizationSplatAnnotations: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.Splats, id: payload.fileId },
        { type: QueryTagTypes.Splats, id: 'LIST' },
      ],
    },
    getOrganizationSplatInfo: {
      providesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Splats, id: payload.fileId }],
    },
    setOrganizationSplatNeedsAttention: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.Splats, id: payload.fileId },
        { type: QueryTagTypes.Splats, id: 'LIST' },
      ],
    },
  },
});
