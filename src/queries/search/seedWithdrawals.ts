import { SearchCountApiResponse, SearchRequestPayload, SearchSortOrderElement } from 'src/queries/generated/search';
import { SeedWithdrawalPurpose } from 'src/types/Accession';
import { SearchNodePayload } from 'src/types/Search';
import { UnitType } from 'src/units';
import { parseSearchTerm } from 'src/utils/search';

import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

const SEED_WITHDRAWAL_FIELDS = [
  'accession_id',
  'accession_accessionNumber',
  'accession_species_scientificName',
  'accession_facility_name',
  'accession_project_name',
  'date',
  'destination',
  'notes',
  'purpose(raw)',
  'quantity(raw)',
  'units(raw)',
];

const parseSearchSeedWithdrawalsArgs = (args: SearchSeedWithdrawalsApiArgs, fields: string[]): SearchRequestPayload => {
  const searchChildren: SearchNodePayload[] = [];

  if (args.organizationId) {
    searchChildren.push({
      operation: 'field',
      field: 'accession_facility_organization_id',
      values: [`${args.organizationId}`],
    });
  }

  if (args.searchTerm) {
    const { type, values } = parseSearchTerm(args.searchTerm);
    searchChildren.push({
      operation: 'or',
      children: [
        { operation: 'field', field: 'accession_accessionNumber', type, values },
        { operation: 'field', field: 'accession_species_scientificName', type, values },
        { operation: 'field', field: 'accession_facility_name', type, values },
        { operation: 'field', field: 'destination', type, values },
      ],
    });
  }

  if (args.accessionNumber) {
    const { type, values } = parseSearchTerm(args.accessionNumber);
    searchChildren.push({
      operation: 'field',
      field: 'accession_accessionNumber',
      type,
      values,
    });
  }

  if (args.date) {
    const minDate = args.date.minDate ?? '1900-01-01';
    const maxDate = args.date.maxDate ?? '9999-12-31';
    searchChildren.push({
      operation: 'field',
      field: 'date',
      type: 'Range',
      values: [minDate, maxDate],
    });
  }

  if (args.purposes?.length) {
    searchChildren.push({
      operation: 'field',
      field: 'purpose',
      type: 'Exact',
      values: args.purposes,
    });
  }

  if (args.speciesNames?.length) {
    searchChildren.push({
      operation: 'field',
      field: 'accession_species_scientificName',
      type: 'Exact',
      values: args.speciesNames,
    });
  }

  if (args.seedBankName) {
    searchChildren.push({
      operation: 'field',
      field: 'accession_facility_name',
      type: 'Exact',
      values: [args.seedBankName],
    });
  }

  if (args.destinations?.length) {
    searchChildren.push({
      operation: 'field',
      field: 'destination',
      type: 'Exact',
      values: args.destinations,
    });
  }

  if (args.projectNames?.length) {
    searchChildren.push({
      operation: 'field',
      field: 'accession_project_name',
      type: 'Exact',
      values: args.projectNames,
    });
  }

  if (args.notes) {
    const { type, values } = parseSearchTerm(args.notes);
    searchChildren.push({ operation: 'field', field: 'notes', type, values });
  }

  const sortOrder = args.sortOrder?.map((orderOption) => {
    switch (orderOption.field) {
      case 'accessionNumber':
        return { ...orderOption, field: 'accession_accessionNumber' };
      case 'speciesName':
        return { ...orderOption, field: 'accession_species_scientificName' };
      case 'seedBankName':
        return { ...orderOption, field: 'accession_facility_name' };
      case 'projectName':
        return { ...orderOption, field: 'accession_project_name' };
      default:
        return orderOption;
    }
  });

  return {
    prefix: 'withdrawals',
    fields,
    search: {
      operation: 'and',
      children: searchChildren,
    },
    count: args.limit,
    cursor: args.offset?.toString(),
    sortOrder: sortOrder ?? [{ field: 'date', direction: 'Descending' }],
  };
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    searchSeedWithdrawalsFilterOptions: build.query<SeedWithdrawalFilterOptions, number>({
      query: (organizationId) => ({
        url: '/api/v1/search/values',
        method: 'POST',
        body: {
          prefix: 'withdrawals',
          fields: ['accession_species_scientificName', 'accession_facility_name', 'destination'],
          search: {
            operation: 'field',
            field: 'accession_facility_organization_id',
            values: [`${organizationId}`],
          },
          count: 0,
        },
      }),
      providesTags: [
        { type: QueryTagTypes.AccessionWithdrawals, id: 'LIST' },
        { type: QueryTagTypes.Accessions, id: 'LIST' },
        { type: QueryTagTypes.Species, id: 'LIST' },
        { type: QueryTagTypes.Projects, id: 'LIST' },
      ],
      transformResponse: (result: SearchSeedWithdrawalFilterOptionsApiResponse) => ({
        speciesNames: result.results.accession_species_scientificName.values.filter(isNonEmpty),
        seedBankNames: result.results.accession_facility_name.values.filter(isNonEmpty),
        destinations: result.results.destination.values.filter(isNonEmpty),
      }),
    }),

    searchSeedWithdrawals: build.query<SearchSeedWithdrawalPayload[], SearchSeedWithdrawalsApiArgs>({
      query: (args) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: parseSearchSeedWithdrawalsArgs(args, SEED_WITHDRAWAL_FIELDS),
      }),
      providesTags: [
        { type: QueryTagTypes.AccessionWithdrawals, id: 'LIST' },
        { type: QueryTagTypes.Accessions, id: 'LIST' },
        { type: QueryTagTypes.Species, id: 'LIST' },
        { type: QueryTagTypes.Projects, id: 'LIST' },
      ],
      transformResponse: (response: SearchSeedWithdrawalApiResponse) =>
        response.results.map((result): SearchSeedWithdrawalPayload => ({
          accessionId: Number(result.accession_id),
          accessionNumber: result.accession_accessionNumber,
          date: result.date,
          destination: result.destination,
          notes: result.notes,
          projectName: result.accession_project_name,
          purpose: result['purpose(raw)'] as SeedWithdrawalPurpose,
          quantity: result['quantity(raw)'] !== undefined ? Number(result['quantity(raw)']) : undefined,
          seedBankName: result.accession_facility_name,
          speciesName: result.accession_species_scientificName,
          units: result['units(raw)'] as UnitType | undefined,
        })),
    }),

    countSeedWithdrawals: build.query<number, SearchSeedWithdrawalsApiArgs>({
      query: (args) => {
        const payload = parseSearchSeedWithdrawalsArgs(args, []);
        return {
          url: '/api/v1/search/count',
          method: 'POST',
          body: { ...payload, count: undefined, cursor: undefined },
        };
      },
      providesTags: [{ type: QueryTagTypes.AccessionWithdrawals, id: 'LIST' }],
      transformResponse: (response: SearchCountApiResponse) => response.count,
    }),
  }),
});

const isNonEmpty = (value: string | null): value is string => typeof value === 'string' && value.trim() !== '';

type SearchSeedWithdrawalFilterOptionsApiResponse = {
  results: {
    accession_species_scientificName: { values: (string | null)[] };
    accession_facility_name: { values: (string | null)[] };
    destination: { values: (string | null)[] };
  };
};

export type SeedWithdrawalFilterOptions = {
  speciesNames: string[];
  seedBankNames: string[];
  destinations: string[];
};

type SeedWithdrawalApiResult = {
  accession_id: string;
  accession_accessionNumber: string;
  accession_species_scientificName?: string;
  accession_facility_name?: string;
  accession_project_name?: string;
  date: string;
  destination?: string;
  notes?: string;
  'purpose(raw)'?: string;
  'quantity(raw)'?: string;
  'units(raw)'?: string;
};

type SearchSeedWithdrawalApiResponse = {
  results: SeedWithdrawalApiResult[];
};

export type SearchSeedWithdrawalsApiArgs = {
  organizationId?: number;
  searchTerm?: string;
  accessionNumber?: string;
  date?: { minDate?: string; maxDate?: string };
  purposes?: SeedWithdrawalPurpose[];
  speciesNames?: string[];
  seedBankName?: string;
  destinations?: string[];
  projectNames?: string[];
  notes?: string;
  sortOrder?: SearchSortOrderElement[];
  limit?: number;
  offset?: number;
};

export type SearchSeedWithdrawalPayload = {
  accessionId: number;
  accessionNumber: string;
  date: string;
  destination?: string;
  notes?: string;
  projectName?: string;
  purpose?: SeedWithdrawalPurpose;
  quantity?: number;
  seedBankName?: string;
  speciesName?: string;
  units?: UnitType;
};

export const {
  useLazyCountSeedWithdrawalsQuery,
  useLazySearchSeedWithdrawalsFilterOptionsQuery,
  useLazySearchSeedWithdrawalsQuery,
} = injectedRtkApi;
