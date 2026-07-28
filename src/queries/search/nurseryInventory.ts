import { FieldNodePayload, PrefixedSearch, SearchNodePayload, SearchResponseElement } from 'src/types/Search';
import { parseSearchTerm } from 'src/utils/search';

import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

export type SearchSpeciesInventoryApiArg = {
  organizationId: number;
  facilityIds?: number[];
  query?: string;
};

export type SearchInventoryByNurseryApiArg = {
  organizationId: number;
  facilityIds?: number[];
  speciesIds?: number[];
  query?: string;
};

const SPECIES_INVENTORY_FACILITY_FIELDS = [
  'id',
  'scientificName',
  'commonName',
  'facilityInventories.activeGrowthQuantity(raw)',
  'facilityInventories.germinatingQuantity(raw)',
  'facilityInventories.hardeningOffQuantity(raw)',
  'facilityInventories.readyQuantity(raw)',
  'facilityInventories.totalQuantity(raw)',
  'facilityInventories.facility_name',
];

const SPECIES_INVENTORY_FIELDS = [
  'id',
  'scientificName',
  'commonName',
  'inventory.facilityInventories.facility_id',
  'inventory.facilityInventories.facility_name',
  'inventory.activeGrowthQuantity(raw)',
  'inventory.germinatingQuantity(raw)',
  'inventory.hardeningOffQuantity(raw)',
  'inventory.readyQuantity(raw)',
  'inventory.totalQuantity(raw)',
];

const NURSERY_INVENTORY_FIELDS = [
  'facility_name',
  'facilityInventories.species_scientificName',
  'germinatingQuantity',
  'hardeningOffQuantity',
  'activeGrowthQuantity',
  'readyQuantity',
  'totalQuantity',
  'facility_id',
  'facilityInventories.species_id',
  'facilityInventories.batches.id',
  'activeGrowthQuantity(raw)',
  'readyQuantity(raw)',
  'germinatingQuantity(raw)',
  'hardeningOffQuantity(raw)',
  'totalQuantity(raw)',
];

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    searchSpeciesInventory: build.query<SearchResponseElement[], SearchSpeciesInventoryApiArg>({
      query: (args) => {
        const forSpecificFacilities = (args.facilityIds?.length ?? 0) > 0;

        const children: SearchNodePayload[] = [
          {
            operation: 'field',
            field: 'organization_id',
            values: [`${args.organizationId}`],
          } as SearchNodePayload,
          {
            operation: 'not',
            // Only species that have had a non-null batch, i.e. that have had inventory at some point
            child: {
              operation: 'field',
              field: 'batches.id',
              values: [null],
            },
          } as SearchNodePayload,
        ];

        if (args.query) {
          const { type, values } = parseSearchTerm(args.query);
          const searchValueChildren: FieldNodePayload[] = [
            'scientificName',
            'commonName',
            'inventory.facilityInventories.facility_name',
          ].map((field) => ({
            operation: 'field',
            field,
            type,
            values,
          }));

          children.push({
            operation: 'or',
            children: searchValueChildren,
          } as SearchNodePayload);
        }

        const filters: PrefixedSearch[] | undefined = args.facilityIds?.length
          ? [
              {
                prefix: 'facilityInventories',
                search: {
                  operation: 'field',
                  field: 'facility_id',
                  values: args.facilityIds.map(String),
                } as SearchNodePayload,
              },
            ]
          : undefined;

        return {
          url: '/api/v1/search',
          method: 'POST',
          body: {
            prefix: 'species',
            fields: forSpecificFacilities ? SPECIES_INVENTORY_FACILITY_FIELDS : SPECIES_INVENTORY_FIELDS,
            search: { operation: 'and', children },
            filters,
            count: 0,
          },
        };
      },
      providesTags: [{ type: QueryTagTypes.NurseryBatches, id: 'LIST' }],
      transformResponse: (response: { results: SearchResponseElement[] }) => response.results,
    }),

    searchInventoryByNursery: build.query<SearchResponseElement[], SearchInventoryByNurseryApiArg>({
      query: (args) => {
        const children: SearchNodePayload[] = [
          {
            operation: 'field',
            field: 'organization_id',
            values: [`${args.organizationId}`],
          } as SearchNodePayload,
        ];

        if (args.query) {
          const { type, values } = parseSearchTerm(args.query);
          const searchValueChildren: FieldNodePayload[] = [
            'facilityInventories.species_scientificName',
            'facility_name',
          ].map((field) => ({
            operation: 'field',
            field,
            type,
            values,
          }));

          children.push({
            operation: 'or',
            children: searchValueChildren,
          } as SearchNodePayload);
        }

        if (args.facilityIds?.length) {
          children.push({
            operation: 'field',
            field: 'facility_id',
            values: args.facilityIds.map(String),
          } as SearchNodePayload);
        }

        if (args.speciesIds?.length) {
          children.push({
            operation: 'field',
            field: 'facilityInventories.species_id',
            values: args.speciesIds.map(String),
          } as SearchNodePayload);
        }

        return {
          url: '/api/v1/search',
          method: 'POST',
          body: {
            prefix: 'facilityInventoryTotals',
            fields: NURSERY_INVENTORY_FIELDS,
            search: { operation: 'and', children },
            count: 0,
          },
        };
      },
      providesTags: [{ type: QueryTagTypes.NurseryBatches, id: 'LIST' }],
      transformResponse: (response: { results: SearchResponseElement[] }) => response.results,
    }),
  }),
});

export { injectedRtkApi as api };

export const {
  useSearchSpeciesInventoryQuery,
  useLazySearchSpeciesInventoryQuery,
  useSearchInventoryByNurseryQuery,
  useLazySearchInventoryByNurseryQuery,
} = injectedRtkApi;
