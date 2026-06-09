import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

export type BatchForWithdraw = {
  batchId: number;
  batchNumber: string;
  speciesId: number;
  scientificName: string;
  commonName?: string;
  readyQuantity: number;
};

export type ListBatchesForWithdrawArgs = {
  facilityId: number;
  speciesIds: number[];
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listBatchesForWithdraw: build.query<BatchForWithdraw[], ListBatchesForWithdrawArgs>({
      query: (args) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'batches',
          fields: [
            'id',
            'batchNumber',
            'species_id',
            'species_scientificName',
            'species_commonName',
            'readyQuantity(raw)',
          ],
          search: {
            operation: 'and',
            children: [
              {
                operation: 'field',
                field: 'facility_id',
                type: 'Exact',
                values: [`${args.facilityId}`],
              },
              {
                operation: 'field',
                field: 'species_id',
                type: 'Exact',
                values: args.speciesIds.map(String),
              },
            ],
          },
          sortOrder: [{ field: 'batchNumber', direction: 'Ascending' }],
          count: 0,
        },
      }),
      providesTags: [{ type: QueryTagTypes.Batches, id: 'LIST' }],
      transformResponse: (response: BatchSearchResponse): BatchForWithdraw[] =>
        response.results.map(
          (result): BatchForWithdraw => ({
            batchId: Number(result.id),
            batchNumber: result.batchNumber,
            speciesId: Number(result.species_id),
            scientificName: result.species_scientificName,
            commonName: result.species_commonName,
            readyQuantity: Number(result['readyQuantity(raw)']),
          })
        ),
    }),
  }),
});

type BatchSearchResult = {
  id: string;
  batchNumber: string;
  species_id: string;
  species_scientificName: string;
  species_commonName?: string;
  'readyQuantity(raw)': string;
};

type BatchSearchResponse = {
  results: BatchSearchResult[];
};

export const { useListBatchesForWithdrawQuery, useLazyListBatchesForWithdrawQuery } = injectedRtkApi;
