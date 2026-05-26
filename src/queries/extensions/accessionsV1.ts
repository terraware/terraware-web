import { api } from '../generated/accessionsV1';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listPhotos: {
      providesTags: (_results, _error, id) => [{ type: QueryTagTypes.Accessions, id }],
    },
    getPhoto: {
      providesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Accessions, id: payload.id }],
    },
    uploadPhoto: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Accessions, id: payload.id }],
    },
    deletePhoto: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Accessions, id: payload.id }],
    },
    checkIn: {
      invalidatesTags: (_results, _error, id) => [
        { type: QueryTagTypes.Accessions, id },
        { type: QueryTagTypes.Accessions, id: 'LIST' },
      ],
    },
    getAccessionHistory: {
      providesTags: (_results, _error, id) => [{ type: QueryTagTypes.Accessions, id }],
    },
    deleteApiV1SeedbankAccessionsById: {
      invalidatesTags: (_results, _error, id) => [
        { type: QueryTagTypes.Accessions, id },
        { type: QueryTagTypes.Accessions, id: 'LIST' },
      ],
    },
  },
});
