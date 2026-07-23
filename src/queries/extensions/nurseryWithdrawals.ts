import { api } from '../generated/nurseryWithdrawals';
import { speciesCacheTags } from '../speciesCacheTags';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    createBatchWithdrawal: {
      invalidatesTags: [
        { type: QueryTagTypes.NurseryWithdrawals, id: 'LIST' },
        { type: QueryTagTypes.PlantingSites },
        { type: QueryTagTypes.PlantingDateRequests, id: 'LIST' },
        { type: QueryTagTypes.Batches, id: 'LIST' },
      ],
    },
    getNurseryWithdrawal: {
      providesTags: (results, _error, withdrawalId) => [
        { type: QueryTagTypes.NurseryWithdrawals, id: withdrawalId },
        ...speciesCacheTags([
          ...(results?.batches ?? []).map((batch) => batch.speciesId),
          ...(results?.delivery?.plantings ?? []).map((planting) => planting.speciesId),
        ]),
      ],
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
