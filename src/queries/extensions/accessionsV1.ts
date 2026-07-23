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
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.Accessions, id: payload.id },
        QueryTagTypes.SeedbankSummary,
      ],
    },
    deletePhoto: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.Accessions, id: payload.id },
        QueryTagTypes.SeedbankSummary,
      ],
    },
    checkIn: {
      invalidatesTags: (_results, _error, id) => [
        { type: QueryTagTypes.Accessions, id },
        { type: QueryTagTypes.Accessions, id: 'LIST' },
        QueryTagTypes.SeedbankSummary,
      ],
    },
    getAccessionHistory: {
      providesTags: (_results, _error, id) => [{ type: QueryTagTypes.Accessions, id }],
    },
    deleteApiV1SeedbankAccessionsById: {
      invalidatesTags: () => [{ type: QueryTagTypes.Accessions, id: 'LIST' }, QueryTagTypes.SeedbankSummary],
    },
  },
});
