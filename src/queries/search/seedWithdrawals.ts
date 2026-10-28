import { SearchCountApiResponse } from 'src/queries/generated/search';

import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    countSeedWithdrawals: build.query<number, CountSeedWithdrawalsApiArgs>({
      query: ({ organizationId }) => ({
        url: '/api/v1/search/count',
        method: 'POST',
        body: {
          prefix: 'withdrawals',
          fields: [],
          search: {
            operation: 'field',
            field: 'accession_facility_organization_id',
            values: [`${organizationId}`],
          },
        },
      }),
      providesTags: [{ type: QueryTagTypes.AccessionWithdrawals, id: 'LIST' }],
      transformResponse: (response: SearchCountApiResponse) => response.count,
    }),
  }),
});

export type CountSeedWithdrawalsApiArgs = {
  organizationId: number;
};

export const { useLazyCountSeedWithdrawalsQuery } = injectedRtkApi;
