import { api } from '../generated/nurseryWithdrawals';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    createBatchWithdrawal: {
      invalidatesTags: (_results, _error, payload) => [
        // The withdrawn batches themselves, so the batch detail and history refresh
        ...payload.batchWithdrawals.map((batchWithdrawal) => ({
          type: QueryTagTypes.NurseryBatches,
          id: batchWithdrawal.batchId,
        })),
        { type: QueryTagTypes.NurseryWithdrawals, id: 'LIST' },
        { type: QueryTagTypes.PlantingSites },
        { type: QueryTagTypes.PlantingDateRequests, id: 'LIST' },
        { type: QueryTagTypes.NurseryBatches, id: 'LIST' },
        { type: QueryTagTypes.NurserySummary },
        { type: QueryTagTypes.NurserySpeciesSummary },
        { type: QueryTagTypes.NurseryOrganizationSummary },
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
        // The undone withdrawal's batches are not in the payload, so every batch is invalidated
        { type: QueryTagTypes.NurseryBatches },
        { type: QueryTagTypes.NurserySummary },
        { type: QueryTagTypes.NurserySpeciesSummary },
        { type: QueryTagTypes.NurseryOrganizationSummary },
      ],
    },
  },
});
