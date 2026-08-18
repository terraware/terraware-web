import { SearchCountApiResponse } from 'src/queries/generated/search';
import { SearchNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { parseSearchTerm } from 'src/utils/search';

import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

const DEFAULT_BATCH_FIELDS = [
  'accession_id',
  'accession_accessionNumber',
  'addedDate',
  'batchNumber',
  'facility_id',
  'facility_name',
  'germinatingQuantity',
  'germinatingQuantity(raw)',
  'germinationStartedDate',
  'hardeningOffQuantity',
  'hardeningOffQuantity(raw)',
  'id',
  'notes',
  'activeGrowthQuantity',
  'activeGrowthQuantity(raw)',
  'project_name',
  'project_id',
  'readyByDate',
  'readyQuantity',
  'readyQuantity(raw)',
  'seedsSownDate',
  'species_scientificName',
  'species_commonName',
  'subLocations.subLocation_id',
  'subLocations.subLocation_name',
  'totalQuantity',
  'totalQuantityWithdrawn',
  'totalQuantity(raw)',
  'totalQuantityWithdrawn(raw)',
  'version',
];

const NURSERY_BATCHES_FIELDS = [...DEFAULT_BATCH_FIELDS, 'species_id', 'species_scientificName', 'species_commonName'];

export type NurseryBatchesSearchResponseElement = SearchResponseElement & {
  accession_id?: string;
  accession_accessionNumber?: string;
  addedDate: string;
  batchNumber: string;
  facility_id: string;
  facility_name: string;
  germinatingQuantity: string;
  'germinatingQuantity(raw)': number;
  germinationStartedDate: string;
  hardeningOffQuantity: string;
  'hardeningOffQuantity(raw)': number;
  id: string;
  notes: string;
  activeGrowthQuantity: string;
  'activeGrowthQuantity(raw)': number;
  readyQuantity: string;
  'readyQuantity(raw)': number;
  readyByDate: string;
  seedsSownDate: string;
  species_id: string;
  species_scientificName: string;
  species_commonName: string;
  subLocations?: { subLocation_id: string; subLocation_name: string }[];
  totalQuantity: string;
  'totalQuantity(raw)': number;
  version: string;
  project_name?: string;
};

type ListBatchesByIdsApiArg = {
  organizationId: number;
  batchIds: number[];
};

export type ListAllBatchesApiArg = {
  organizationId: number;
  sortOrder?: SearchSortOrder;
  nurseryIds?: number[];
  subLocationIds?: number[];
  /** A null entry matches batches with no project. */
  projectIds?: (number | null)[];
  query?: string;
};

type ListBatchIdsForSpeciesApiArg = {
  organizationId: number;
  speciesIds: number[];
};

type ListBatchesForSpeciesApiArg = {
  organizationId: number;
  speciesId: number;
  searchFields?: SearchNodePayload[];
  sortOrder?: SearchSortOrder;
};

type ListBatchesForNurseryApiArg = {
  organizationId: number;
  nurseryId: number;
  searchFields?: SearchNodePayload[];
  sortOrder?: SearchSortOrder;
};

const organizationScoped = (organizationId: number, children: SearchNodePayload[]): SearchNodePayload => ({
  operation: 'and',
  children: [
    {
      operation: 'field',
      field: 'facility_organization_id',
      values: [`${organizationId}`],
    } as SearchNodePayload,
    ...children,
  ],
});

const buildAllBatchesRequest = (args: ListAllBatchesApiArg) => {
  const children: SearchNodePayload[] = [
    {
      operation: 'field',
      field: 'facility_organization_id',
      type: 'Exact',
      values: [`${args.organizationId}`],
    },
  ];

  if (args.nurseryIds?.length) {
    children.push({
      operation: 'field',
      field: 'facility_id',
      type: 'Exact',
      values: args.nurseryIds.map(String),
    });
  }

  if (args.subLocationIds?.length) {
    children.push({
      operation: 'field',
      field: 'subLocations.subLocation_id',
      type: 'Exact',
      values: args.subLocationIds.map(String),
    });
  }

  if (args.projectIds?.length) {
    children.push({
      operation: 'field',
      field: 'project_id',
      type: 'Exact',
      values: args.projectIds.map((projectId) => (projectId === null ? null : String(projectId))),
    });
  }

  if (args.query) {
    const { type, values } = parseSearchTerm(args.query, 'PartialOrFuzzy');
    children.push({
      operation: 'or',
      children: ['batchNumber', 'species_scientificName', 'species_commonName', 'facility_name'].map((field) => ({
        operation: 'field',
        field,
        type,
        values,
      })),
    });
  }

  return {
    prefix: 'batches',
    fields: NURSERY_BATCHES_FIELDS,
    search: {
      operation: 'and',
      children,
    },
    sortOrder: [args.sortOrder ?? { field: 'batchNumber' }],
    count: 0,
  };
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    countAllBatches: build.query<number, number>({
      query: (organizationId) => ({
        url: '/api/v1/search/count',
        method: 'POST',
        body: {
          prefix: 'batches',
          fields: [],
          search: {
            operation: 'field',
            field: 'facility_organization_id',
            values: [`${organizationId}`],
          },
        },
      }),
      providesTags: [{ type: QueryTagTypes.NurseryBatches, id: 'LIST' }],
      transformResponse: (response: SearchCountApiResponse) => response.count,
    }),

    listBatchesByIds: build.query<NurseryBatchesSearchResponseElement[], ListBatchesByIdsApiArg>({
      query: (args) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'batches',
          fields: NURSERY_BATCHES_FIELDS,
          search: organizationScoped(args.organizationId, [
            {
              operation: 'field',
              field: 'id',
              type: 'Exact',
              values: args.batchIds.map(String),
            },
          ]),
          count: 1000,
        },
      }),
      providesTags: [{ type: QueryTagTypes.NurseryBatches, id: 'LIST' }],
      transformResponse: (response: BatchSearchResponse) => response.results,
    }),

    listAllBatches: build.query<NurseryBatchesSearchResponseElement[], ListAllBatchesApiArg>({
      query: (args) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: buildAllBatchesRequest(args),
      }),
      providesTags: [{ type: QueryTagTypes.NurseryBatches, id: 'LIST' }],
      transformResponse: (response: BatchSearchResponse) => response.results,
    }),

    listBatchIdsForSpecies: build.query<number[], ListBatchIdsForSpeciesApiArg>({
      query: (args) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'batches',
          fields: ['id'],
          search: organizationScoped(args.organizationId, [
            {
              operation: 'field',
              field: 'species_id',
              type: 'Exact',
              values: args.speciesIds.map(String),
            },
          ]),
          count: 1000,
        },
      }),
      providesTags: [{ type: QueryTagTypes.NurseryBatches, id: 'LIST' }],
      transformResponse: (response: { results: { id: string }[] }) =>
        response.results.map((result) => Number(result.id)),
    }),

    listBatchesForSpecies: build.query<NurseryBatchesSearchResponseElement[], ListBatchesForSpeciesApiArg>({
      query: (args) => {
        const children: SearchNodePayload[] = [
          {
            operation: 'field',
            field: 'species_id',
            values: [`${args.speciesId}`],
          } as SearchNodePayload,
          {
            operation: 'field',
            field: 'species_organization_id',
            type: 'Exact',
            values: [`${args.organizationId}`],
          },
        ];

        if (args.searchFields?.length) {
          children.push({
            operation: 'and',
            children: args.searchFields,
          });
        }

        return {
          url: '/api/v1/search',
          method: 'POST',
          body: {
            prefix: 'batches',
            fields: DEFAULT_BATCH_FIELDS,
            search: { operation: 'and', children },
            sortOrder: [args.sortOrder ?? { field: 'batchNumber' }],
            count: 1000,
          },
        };
      },
      providesTags: [{ type: QueryTagTypes.NurseryBatches, id: 'LIST' }],
      transformResponse: (response: BatchSearchResponse) => response.results,
    }),

    listBatchesForNursery: build.query<NurseryBatchesSearchResponseElement[], ListBatchesForNurseryApiArg>({
      query: (args) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'batches',
          fields: NURSERY_BATCHES_FIELDS,
          search: {
            operation: 'and',
            children: [
              {
                operation: 'field',
                field: 'facility_id',
                values: [`${args.nurseryId}`],
              } as SearchNodePayload,
              {
                operation: 'field',
                field: 'species_organization_id',
                values: [`${args.organizationId}`],
              } as SearchNodePayload,
              ...(args.searchFields ?? []),
            ],
          },
          sortOrder: [args.sortOrder ?? { field: 'batchNumber' }],
          count: 1000,
        },
      }),
      providesTags: [{ type: QueryTagTypes.NurseryBatches, id: 'LIST' }],
      transformResponse: (response: BatchSearchResponse) => response.results,
    }),
  }),
});

type BatchSearchResponse = {
  results: NurseryBatchesSearchResponseElement[];
};

export const {
  useLazyCountAllBatchesQuery,
  useLazyListBatchesByIdsQuery,
  useLazyListAllBatchesQuery,
  useLazyListBatchIdsForSpeciesQuery,
  useListBatchesForSpeciesQuery,
  useListBatchesForNurseryQuery,
} = injectedRtkApi;
