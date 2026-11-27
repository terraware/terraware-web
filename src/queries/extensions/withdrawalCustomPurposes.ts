import { api } from '../generated/withdrawalCustomPurposes';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listCustomPurposes: {
      providesTags: [{ type: QueryTagTypes.WithdrawalCustomPurposes, id: 'LIST' }],
    },
    updateCustomPurpose: {
      invalidatesTags: () => [
        { type: QueryTagTypes.WithdrawalCustomPurposes, id: 'LIST' },
        // Renaming a purpose changes how past withdrawals and batch histories read
        { type: QueryTagTypes.NurseryWithdrawals },
        { type: QueryTagTypes.NurseryBatches },
      ],
    },
  },
});
