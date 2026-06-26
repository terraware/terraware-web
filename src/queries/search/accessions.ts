import { AccessionState } from 'src/types/Accession';
import {
  SearchCriteria,
  SearchNodePayload,
  SearchResponseElement,
  SearchResponseElementWithId,
  SearchSortOrder,
} from 'src/types/Search';
import { UnitType } from 'src/units';

import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

export type SearchResponseAccession = {
  id: string;
  accessionNumber: string;
  estimatedCount?: string;
  'estimatedCount(raw)'?: string;
  remainingQuantity?: string;
  'remainingQuantity(raw)'?: string;
  remainingUnits?: UnitType;
  speciesName: string;
  state: AccessionState;
};

export type SearchAccessionsApiArg = {
  organizationId: number;
  fields: string[];
  searchCriteria?: SearchCriteria;
  sortOrder?: SearchSortOrder;
};

export type GetCollectorsApiArg = number;
export type GetCollectionSiteNamesApiArg = number;
export type GetAccessionForSpeciesApiArg = {
  organizationId: number;
  speciesId: number;
};
export type GetPendingAccessionsApiArg = number;

type SearchResponse<T> = {
  results: T[];
};

type SearchValuesResponse = {
  results?: Record<string, { values: (string | null)[] }>;
};

const SEARCH_FIELDS_ACCESSIONS = [
  'id',
  'accessionNumber',
  'estimatedCount',
  'estimatedCount(raw)',
  'remainingQuantity',
  'remainingQuantity(raw)',
  'remainingUnits',
  'speciesName',
  'state',
];

const buildOrgSearch = (organizationId: number, extraCriteria: SearchNodePayload[]): SearchNodePayload => ({
  operation: 'and',
  children: [
    {
      operation: 'field',
      field: 'facility_organization_id',
      values: [String(organizationId)],
    },
    ...extraCriteria,
  ],
});

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    searchAccessions: build.query<SearchResponseElement[], SearchAccessionsApiArg>({
      query: ({ organizationId, fields, searchCriteria, sortOrder }) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'accessions',
          fields,
          search: buildOrgSearch(organizationId, Object.values(searchCriteria ?? {})),
          ...(sortOrder ? { sortOrder: [sortOrder] } : {}),
          count: 0,
        },
      }),
      transformResponse: (response: SearchResponse<SearchResponseElement>) => response?.results ?? [],
      providesTags: (result) => [
        ...(result ?? [])
          .map((r) => r.id)
          .filter((id): id is string => typeof id === 'string')
          .map((id) => ({ type: QueryTagTypes.Accessions as const, id })),
        { type: QueryTagTypes.Accessions, id: 'LIST' },
      ],
    }),
    getPendingAccessions: build.query<SearchResponseElementWithId[], GetPendingAccessionsApiArg>({
      query: (organizationId) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'accessions',
          fields: [
            'accessionNumber',
            'speciesName',
            'collectionSiteName',
            'collectedTime',
            'receivedDate',
            'id',
            'facility_name',
          ],
          search: buildOrgSearch(organizationId, [
            {
              operation: 'field',
              field: 'state(raw)',
              type: 'Exact',
              values: ['Awaiting Check-In'],
            },
          ]),
          sortOrder: [{ field: 'accessionNumber', direction: 'Ascending' }],
          count: 1000,
        },
      }),
      transformResponse: (response: SearchResponse<SearchResponseElementWithId>) => response?.results ?? [],
      providesTags: (result) => [
        ...(result ?? []).map((r) => ({ type: QueryTagTypes.Accessions as const, id: r.id })),
        { type: QueryTagTypes.Accessions, id: 'LIST' },
      ],
    }),
    getCollectors: build.query<string[], GetCollectorsApiArg>({
      query: (organizationId) => ({
        url: '/api/v1/search/values',
        method: 'POST',
        body: {
          prefix: 'accessions',
          fields: ['collectors_name'],
          search: buildOrgSearch(organizationId, []),
          count: 1000,
        },
      }),
      transformResponse: (response: SearchValuesResponse) =>
        (response?.results?.collectors_name?.values ?? []).filter((v): v is string => v !== null),
      providesTags: [{ type: QueryTagTypes.Accessions, id: 'LIST' }],
    }),
    getCollectionSiteNames: build.query<string[], GetCollectionSiteNamesApiArg>({
      query: (organizationId) => ({
        url: '/api/v1/search/values',
        method: 'POST',
        body: {
          prefix: 'accessions',
          fields: ['collectionSiteName'],
          search: buildOrgSearch(organizationId, []),
          count: 1000,
        },
      }),
      transformResponse: (response: SearchValuesResponse) =>
        (response?.results?.collectionSiteName?.values ?? []).filter((v): v is string => v !== null),
      providesTags: [{ type: QueryTagTypes.Accessions, id: 'LIST' }],
    }),
    getAccessionForSpecies: build.query<SearchResponseAccession[], GetAccessionForSpeciesApiArg>({
      query: ({ organizationId, speciesId }) => {
        const criteria: SearchNodePayload[] = [
          {
            operation: 'not',
            child: {
              operation: 'field',
              field: 'state(raw)',
              type: 'Exact',
              values: ['Used Up'],
            },
          },
        ];
        if (speciesId !== -1) {
          criteria.push({
            operation: 'field',
            field: 'species_id',
            type: 'Exact',
            values: [String(speciesId)],
          });
        }
        return {
          url: '/api/v1/search',
          method: 'POST',
          body: {
            prefix: 'accessions',
            fields: SEARCH_FIELDS_ACCESSIONS,
            search: buildOrgSearch(organizationId, criteria),
            count: 0,
          },
        };
      },
      transformResponse: (response: SearchResponse<SearchResponseAccession>) => response?.results ?? [],
      providesTags: (result) => [
        ...(result ?? []).map((r) => ({ type: QueryTagTypes.Accessions as const, id: r.id })),
        { type: QueryTagTypes.Accessions, id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export { injectedRtkApi as api };

export const {
  useSearchAccessionsQuery,
  useLazySearchAccessionsQuery,
  useGetPendingAccessionsQuery,
  useLazyGetPendingAccessionsQuery,
  useGetCollectorsQuery,
  useLazyGetCollectorsQuery,
  useGetCollectionSiteNamesQuery,
  useLazyGetCollectionSiteNamesQuery,
  useGetAccessionForSpeciesQuery,
  useLazyGetAccessionForSpeciesQuery,
} = injectedRtkApi;
