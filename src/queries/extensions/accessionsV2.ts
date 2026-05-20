import { api } from '../generated/accessionsV2';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    createAccession: {
      invalidatesTags: [
        { type: QueryTagTypes.Accessions, id: 'LIST' },
        { type: QueryTagTypes.Accessions, id: 'PENDING' },
      ],
    },
    getAccession: {
      providesTags: (_results, _error, id) => [{ type: QueryTagTypes.Accessions, id }],
    },
    updateAccession: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.Accessions, id: payload.id },
        { type: QueryTagTypes.Accessions, id: 'LIST' },
      ],
    },
    resolveAccessionsListUpload: {
      invalidatesTags: [
        { type: QueryTagTypes.Accessions, id: 'LIST' },
        { type: QueryTagTypes.Accessions, id: 'PENDING' },
      ],
    },
    createNurseryTransferWithdrawal: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Accessions, id: payload.accessionId }],
    },
    listViabilityTests: {
      providesTags: (_results, _error, accessionId) => [{ type: QueryTagTypes.Accessions, id: accessionId }],
    },
    createViabilityTest: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Accessions, id: payload.accessionId }],
    },
    updateViabilityTest: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Accessions, id: payload.accessionId }],
    },
    deleteViabilityTest: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Accessions, id: payload.accessionId }],
    },
    getViabilityTest: {
      providesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Accessions, id: payload.accessionId }],
    },
    listWithdrawals: {
      providesTags: (_results, _error, accessionId) => [{ type: QueryTagTypes.Accessions, id: accessionId }],
    },
    createWithdrawal: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Accessions, id: payload.accessionId }],
    },
    updateWithdrawal: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Accessions, id: payload.accessionId }],
    },
    deleteWithdrawal: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Accessions, id: payload.accessionId }],
    },
    getWithdrawal: {
      providesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Accessions, id: payload.accessionId }],
    },
  },
});
