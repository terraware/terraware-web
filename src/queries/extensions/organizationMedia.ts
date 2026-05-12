import { api } from '../generated/organizationMedia';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    uploadOrganizationMediaFile: {
      invalidatesTags: [{ type: QueryTagTypes.OrganizationMedia, id: 'LIST' }],
    },
    deleteOrganizationMediaFile: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.OrganizationMedia, id: payload.fileId },
        { type: QueryTagTypes.OrganizationMedia, id: 'LIST' },
      ],
    },
    downloadOrganizationMediaFile: {
      providesTags: (_results, _error, payload) => [{ type: QueryTagTypes.OrganizationMedia, id: payload.fileId }],
    },
    updateOrganizationMediaFile: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.OrganizationMedia, id: payload.fileId },
        { type: QueryTagTypes.OrganizationMedia, id: 'LIST' },
      ],
    },
    getOrganizationMediaFileStream: {
      providesTags: (_results, _error, payload) => [{ type: QueryTagTypes.OrganizationMedia, id: payload.fileId }],
    },
    getOrganizationMediaFileThumbnail: {
      providesTags: (_results, _error, payload) => [{ type: QueryTagTypes.OrganizationMedia, id: payload.fileId }],
    },
  },
});
