import { api } from '../generated/nurseryWithdrawals';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    createBatchWithdrawal: {
      invalidatesTags: [
        { type: QueryTagTypes.NurseryWithdrawals, id: 'LIST' },
        { type: QueryTagTypes.PlantingSites },
        { type: QueryTagTypes.PlantingSeasonDates, id: 'REQUESTS' },
        { type: QueryTagTypes.Batches, id: 'LIST' },
      ],
    },
    getNurseryWithdrawal: {
      providesTags: (_results, _error, withdrawalId) => [{ type: QueryTagTypes.NurseryWithdrawals, id: withdrawalId }],
    },
    listWithdrawalPhotos: {
      providesTags: (_results, _error, withdrawalId) => [
        { type: QueryTagTypes.NurseryWithdrawalPhotos, id: withdrawalId },
      ],
    },
    uploadWithdrawalPhoto: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.NurseryWithdrawalPhotos, id: payload.withdrawalId },
      ],
    },
    getWithdrawalPhoto: {
      providesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.NurseryWithdrawalPhotos, id: payload.withdrawalId },
      ],
    },
    undoBatchWithdrawal: {
      invalidatesTags: (_results, _error, withdrawalId) => [
        { type: QueryTagTypes.NurseryWithdrawals, id: withdrawalId },
        { type: QueryTagTypes.NurseryWithdrawals, id: 'LIST' },
        { type: QueryTagTypes.PlantingSites },
      ],
    },
  },
});
