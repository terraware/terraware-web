import { Point } from 'src/queries/generated/nurseryWithdrawals';
import {
  SearchCountApiResponse,
  SearchNodePayload,
  SearchRequestPayload,
  SearchSortOrderElement,
} from 'src/queries/generated/search';
import { NurseryWithdrawalPurpose } from 'src/types/Batch';
import { parseSearchTerm } from 'src/utils/search';

import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

export type WithdrawalPhotoSearchEntry = {
  capturedLocalTime?: string;
  gpsCoordinates: Point;
  photoId: number;
  withdrawalId: number;
  withdrawnDate: string;
};

const parseSearchNurseryWithdrawalsArgs = (
  args: SearchNurseryWithdrawalsApiArgs,
  fields: string[]
): SearchRequestPayload => {
  const searchChildren: SearchNodePayload[] = [];

  if (args.organizationId) {
    searchChildren.push({
      operation: 'field',
      field: 'facility_organization_id',
      values: [`${args.organizationId}`],
    });
  }

  if (args.withdrawalId) {
    searchChildren.push({
      operation: 'field',
      field: 'id',
      values: [`${args.withdrawalId}`],
    });
  }

  if (args.plantingSiteId) {
    searchChildren.push({
      operation: 'field',
      field: 'delivery.plantings.plantingSite.id',
      values: [`${args.plantingSiteId}`],
    });
  }

  if (args.searchTerm) {
    const { type, values } = parseSearchTerm(args.searchTerm);
    searchChildren.push({
      operation: 'or',
      children: [
        {
          operation: 'field',
          field: 'facility_name',
          type,
          values,
        },
        {
          operation: 'field',
          field: 'destinationName',
          type,
          values,
        },
        {
          operation: 'field',
          field: 'batchWithdrawals.batch_species_scientificName',
          type,
          values,
        },
      ],
    });
  }

  if (args.projectNames?.length) {
    searchChildren.push({
      operation: 'or',
      children: [
        {
          operation: 'field',
          field: 'batchWithdrawals.batch_project_name',
          type: 'Exact',
          values: args.projectNames,
        },
        {
          operation: 'field',
          field: 'batchWithdrawals.destinationBatchProjectName',
          type: 'Exact',
          values: args.projectNames,
        },
      ],
    });
  }

  if (args.withdrawnDate) {
    const minDate = args.withdrawnDate.minDate ?? '1900-01-01';
    const maxDate = args.withdrawnDate.maxDate ?? '9999-12-31';
    searchChildren.push({
      operation: 'field',
      field: 'withdrawnDate',
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

  if (args.nurseryName) {
    searchChildren.push({
      operation: 'field',
      field: 'facility_name',
      type: 'Exact',
      values: [args.nurseryName],
    });
  }

  if (args.destinationNames?.length) {
    searchChildren.push({
      operation: 'field',
      field: 'destinationName',
      type: 'Exact',
      values: args.destinationNames,
    });
  }

  if (args.stratumNames?.length) {
    searchChildren.push({
      operation: 'field',
      field: 'stratumNames',
      type: 'Exact',
      values: args.stratumNames,
    });
  }

  if (args.substratumNames?.length) {
    searchChildren.push({
      operation: 'field',
      field: 'substratumShortNames',
      type: 'Exact',
      values: args.substratumNames,
    });
  }

  if (args.speciesNames?.length) {
    searchChildren.push({
      operation: 'field',
      field: 'batchWithdrawals_batch_species_scientificName',
      type: 'Exact',
      values: args.speciesNames,
    });
  }

  if (args.totalWithdrawn) {
    const minValue = args.totalWithdrawn.minValue?.toString() ?? '0';
    const maxValue = args.totalWithdrawn.maxValue?.toString() ?? '999999999';
    searchChildren.push({
      operation: 'field',
      field: 'totalWithdrawn(raw)',
      type: 'Range',
      values: [minValue, maxValue],
    });
  }

  const sortOrder = args.sortOrder?.flatMap((orderOption) => {
    switch (orderOption.field) {
      case 'nurseryName':
        return [
          {
            ...orderOption,
            field: 'facility_name',
          },
        ];
      case 'stratumName':
        return [
          {
            ...orderOption,
            field: 'stratumNames',
          },
        ];
      case 'substratumShortName':
        return [
          {
            ...orderOption,
            field: 'substratumShortNames',
          },
        ];
      case 'projectNames':
        return [
          {
            ...orderOption,
            field: 'batchWithdrawals.batch_project_name',
          },
          {
            ...orderOption,
            field: 'batchWithdrawals.destinationBatchProjectName',
          },
        ];
      case 'speciesNames':
        return [
          {
            ...orderOption,
            field: 'batchWithdrawals.batch_species_scientificName',
          },
        ];
      default:
        return [orderOption];
    }
  });

  return {
    prefix: 'nurseryWithdrawals',
    fields,
    search: {
      operation: 'and',
      children: searchChildren,
    },
    count: args.limit,
    cursor: args.offset?.toString(),
    sortOrder: [...(sortOrder ?? []), { field: 'id', direction: 'Descending' }],
  };
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    searchNurseryWithdrawalsFilterOptions: build.query<NurseryWithdrawalFilterOptions, number>({
      query: (organizationId) => ({
        url: '/api/v1/search/values',
        method: 'POST',
        body: {
          prefix: 'nurseryWithdrawals',
          fields: [
            'facility_name',
            'destinationName',
            'stratumNames',
            'substratumShortNames',
            'batchWithdrawals_batch_species_scientificName',
          ],
          search: {
            operation: 'field',
            field: 'facility_organization_id',
            values: [`${organizationId}`],
          },
        },
      }),
      providesTags: [{ type: QueryTagTypes.NurseryWithdrawals }],
      transformResponse: (result: SearchNurseryWithdrawalFilterOptionsApiResponse) => ({
        nurseryNames: result.results.facility_name.values,
        destinationNames: result.results.destinationName.values,
        stratumNames: result.results.stratumNames.values,
        substratumNames: result.results.substratumShortNames.values,
        speciesNames: result.results.batchWithdrawals_batch_species_scientificName.values,
      }),
    }),

    searchNurseryWithdrawals: build.query<SearchNurseryWithdrawalPayload[], SearchNurseryWithdrawalsApiArgs>({
      query: (args) => {
        return {
          url: '/api/v1/search',
          method: 'POST',
          body: parseSearchNurseryWithdrawalsArgs(args, [
            'id',
            'delivery_id',
            'withdrawnDate',
            'purpose(raw)',
            'facility_name',
            'destinationName',
            'stratumNames',
            'substratumNames',
            'substratumShortNames',
            'totalWithdrawn(raw)',
            'hasReassignments',
            'batchWithdrawals.batch_project_name',
            'batchWithdrawals.batch_species_scientificName',
            'batchWithdrawals.destinationBatchProjectName',
            'undoesWithdrawalId',
            'undoneByWithdrawalId',
            'undoesWithdrawalDate',
          ]),
        };
      },
      providesTags: (results) => [
        ...(results?.map((result) => ({ type: QueryTagTypes.NurseryWithdrawals, id: result.withdrawalId })) ?? []),
        { type: QueryTagTypes.NurseryWithdrawals, id: 'List' },
      ],
      transformResponse: (response: SearchNurseryWithdrawalApiResponse) =>
        response.results.map(
          (result): SearchNurseryWithdrawalPayload => ({
            withdrawalId: Number(result.id),
            deliveryId: Number(result.delivery_id),
            withdrawnDate: result.withdrawnDate,
            purpose: result['purpose(raw)'] as NurseryWithdrawalPurpose,
            nurseryName: result.facility_name,
            destinationName: result.destinationName,
            stratumName: result.stratumNames,
            substratumName: result.substratumNames,
            substratumShortName: result.substratumShortNames,
            totalWithdrawn: Number(result['totalWithdrawn(raw)']),
            hasReassignments: Boolean(result.hasReassignments),
            projectNames: Array.from(
              new Set(
                (result.batchWithdrawals ?? [])
                  .flatMap((batchWithdrawal) => [
                    batchWithdrawal.batch_project_name,
                    batchWithdrawal.destinationBatchProjectName,
                  ])
                  .filter((projectName): projectName is string => projectName !== undefined)
              )
            ).sort(),
            speciesNames: Array.from(
              new Set(
                (result.batchWithdrawals ?? []).map((batchWithdrawal) => batchWithdrawal.batch_species_scientificName)
              )
            ).sort(),
            undoesWithdrawalDate: result.undoesWithdrawalDate,
            undoesWithdrawalId: result.undoesWithdrawalId ? Number(result.undoesWithdrawalId) : undefined,

            undoneByWithdrawalId: result.undoneByWithdrawalId ? Number(result.undoneByWithdrawalId) : undefined,
          })
        ),
    }),

    countNurseryWithdrawals: build.query<number, SearchNurseryWithdrawalsApiArgs>({
      query: (args) => {
        const payload = parseSearchNurseryWithdrawalsArgs(args, []);
        return {
          url: '/api/v1/search/count',
          method: 'POST',
          body: { ...payload, count: undefined, cursor: undefined },
        };
      },
      providesTags: [{ type: QueryTagTypes.NurseryWithdrawals, id: 'List' }],
      transformResponse: (response: SearchCountApiResponse) => response.count,
    }),

    searchNurseryWithdrawalPhotos: build.query<WithdrawalPhotoSearchEntry[], SearchNurseryWithdrawalPhotosApiArgs>({
      query: ({ plantingSiteId }) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'nurseryWithdrawalPhotos',
          fields: ['capturedLocalTime', 'fileId', 'gpsCoordinate', 'withdrawal.id', 'withdrawal.withdrawnDate'],
          search: {
            operation: 'field',
            field: 'withdrawal.delivery.plantings.plantingSite.id',
            values: [`${plantingSiteId}`],
          },
          count: 0,
        },
      }),
      providesTags: [{ type: QueryTagTypes.NurseryWithdrawals, id: 'List' }],
      transformResponse: (response: SearchNurseryWithdrawalPhotosApiResponse): WithdrawalPhotoSearchEntry[] =>
        response.results.flatMap((result): WithdrawalPhotoSearchEntry[] => {
          if (!result.gpsCoordinate || !result.withdrawal?.id || !result.withdrawal.withdrawnDate || !result.fileId) {
            return [];
          }

          let point: Point;
          try {
            point = JSON.parse(result.gpsCoordinate) as Point;
          } catch {
            return [];
          }
          if (point?.type !== 'Point' || !Array.isArray(point.coordinates) || point.coordinates.length < 2) {
            return [];
          }

          return [
            {
              capturedLocalTime: result.capturedLocalTime,
              gpsCoordinates: point,
              photoId: Number(result.fileId),
              withdrawalId: Number(result.withdrawal.id),
              withdrawnDate: result.withdrawal.withdrawnDate,
            },
          ];
        }),
    }),
  }),
});

type SearchNurseryWithdrawalFilterOptionsApiResponse = {
  results: {
    facility_name: { values: string[] };
    destinationName: { values: string[] };
    stratumNames: { values: string[] };
    substratumShortNames: { values: string[] };
    batchWithdrawals_batch_species_scientificName: { values: string[] };
  };
};

export type NurseryWithdrawalFilterOptions = {
  nurseryNames: string[];
  destinationNames: string[];
  stratumNames: string[];
  substratumNames: string[];
  speciesNames: string[];
};

export type SearchNurseryWithdrawalPhotosApiArgs = {
  plantingSiteId: number;
};

type NurseryWithdrawalPhotoApiResult = {
  capturedLocalTime?: string;
  fileId?: string;
  gpsCoordinate?: string;
  withdrawal?: {
    id?: string;
    withdrawnDate?: string;
  };
};

type SearchNurseryWithdrawalPhotosApiResponse = {
  results: NurseryWithdrawalPhotoApiResult[];
};

export type SearchNurseryWithdrawalsApiArgs = {
  organizationId?: number;
  withdrawalId?: number;
  plantingSiteId?: number;
  searchTerm?: string;
  withdrawnDate?: { minDate?: string; maxDate?: string };
  purposes?: NurseryWithdrawalPurpose[];
  projectNames?: string[];
  nurseryName?: string;
  destinationNames?: string[];
  stratumNames?: string[];
  substratumNames?: string[];
  speciesNames?: string[];
  totalWithdrawn?: { minValue?: number; maxValue?: number };
  sortOrder?: SearchSortOrderElement[];
  limit?: number;
  offset?: number;
};

type NurseryWithdrawalBatchApiResult = {
  batch_project_name?: string;
  batch_species_scientificName: string;
  destinationBatchProjectName?: string;
};

type NurseryWithdrawalApiResult = {
  id: string;
  delivery_id: string;
  withdrawnDate: string;
  'purpose(raw)': string;
  facility_name: string;
  destinationName?: string;
  stratumNames?: string;
  substratumNames?: string;
  substratumShortNames?: string;
  'totalWithdrawn(raw)': string;
  hasReassignments: string;
  batchWithdrawals: NurseryWithdrawalBatchApiResult[];
  undoesWithdrawalId?: string;
  undoneByWithdrawalId?: string;
  undoesWithdrawalDate?: string;
};

type SearchNurseryWithdrawalApiResponse = {
  results: NurseryWithdrawalApiResult[];
};

export type SearchNurseryWithdrawalPayload = {
  withdrawalId: number;
  deliveryId: number;
  withdrawnDate: string;
  purpose: NurseryWithdrawalPurpose;
  nurseryName: string;
  destinationName?: string;
  stratumName?: string;
  substratumName?: string;
  substratumShortName?: string;
  totalWithdrawn: number;
  speciesNames?: string[];
  projectNames?: string[];
  hasReassignments: boolean;
  undoesWithdrawalId?: number;
  undoneByWithdrawalId?: number;
  undoesWithdrawalDate?: string;
};

export { injectedRtkApi as api };

export const {
  useSearchNurseryWithdrawalsFilterOptionsQuery,
  useLazySearchNurseryWithdrawalsFilterOptionsQuery,
  useSearchNurseryWithdrawalsQuery,
  useLazySearchNurseryWithdrawalsQuery,
  useCountNurseryWithdrawalsQuery,
  useLazyCountNurseryWithdrawalsQuery,
  useSearchNurseryWithdrawalPhotosQuery,
  useLazySearchNurseryWithdrawalPhotosQuery,
} = injectedRtkApi;
