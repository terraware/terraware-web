import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

export type BatchForWithdraw = {
  batchId: number;
  batchNumber: string;
  facilityId: number;
  facilityName: string;
  speciesId: number;
  scientificName: string;
  commonName?: string;
  readyQuantity: number;
  projectId?: number;
  projectName?: string;
};

export type ListBatchesForWithdrawArgs = {
  organizationId: number;
  facilityId?: number;
  speciesIds: number[];
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listBatchesForWithdraw: build.query<BatchForWithdraw[], ListBatchesForWithdrawArgs>({
      query: (args) => {
        const filters = [
          {
            operation: 'field',
            field: 'facility_organization_id',
            type: 'Exact',
            values: [`${args.organizationId}`],
          },
          {
            operation: 'field',
            field: 'species_id',
            type: 'Exact',
            values: args.speciesIds.map(String),
          },
        ];

        if (args.facilityId) {
          filters.push({
            operation: 'field',
            field: 'facility_id',
            type: 'Exact',
            values: [`${args.facilityId}`],
          });
        }

        return {
          url: '/api/v1/search',
          method: 'POST',
          body: {
            prefix: 'batches',
            fields: [
              'id',
              'batchNumber',
              'facility_id',
              'facility_name',
              'species_id',
              'species_scientificName',
              'species_commonName',
              'readyQuantity(raw)',
              'project_id',
              'project_name',
            ],
            search: {
              operation: 'and',
              children: filters,
            },
            sortOrder: [{ field: 'batchNumber', direction: 'Ascending' }],
            count: 0,
          },
        };
      },
      providesTags: [{ type: QueryTagTypes.Batches, id: 'LIST' }],
      transformResponse: (response: BatchSearchResponse): BatchForWithdraw[] =>
        response.results.map(
          (result): BatchForWithdraw => ({
            batchId: Number(result.id),
            batchNumber: result.batchNumber,
            facilityId: Number(result.facility_id),
            facilityName: result.facility_name,
            speciesId: Number(result.species_id),
            scientificName: result.species_scientificName,
            commonName: result.species_commonName,
            readyQuantity: Number(result['readyQuantity(raw)'] ?? 0),
            projectId: result.project_id ? Number(result.project_id) : undefined,
            projectName: result.project_name,
          })
        ),
    }),
  }),
});

type BatchSearchResult = {
  id: string;
  batchNumber: string;
  facility_id: string;
  facility_name: string;
  species_id: string;
  species_scientificName: string;
  species_commonName?: string;
  'readyQuantity(raw)': string;
  project_id?: string;
  project_name?: string;
};

type BatchSearchResponse = {
  results: BatchSearchResult[];
};

export const { useListBatchesForWithdrawQuery, useLazyListBatchesForWithdrawQuery } = injectedRtkApi;
