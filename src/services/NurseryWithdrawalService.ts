import { paths } from 'src/api/types/generated-schema';
import strings from 'src/strings';
import { Batch, NurseryWithdrawal } from 'src/types/Batch';
import {
  FieldOptionsMap,
  SearchNodePayload,
  SearchRequestPayload,
  SearchResponseElement,
  SearchSortOrder,
} from 'src/types/Search';
import { Delivery } from 'src/types/Tracking';

import HttpService, { Response } from './HttpService';
import PhotoService from './PhotoService';
import SearchService from './SearchService';

/**
 * Nursery withdrawal related services
 */

const BATCH_WITHDRAWALS_ENDPOINT = '/api/v1/nursery/withdrawals';
const WITHDRAWAL_PHOTOS_ENDPOINT = '/api/v1/nursery/withdrawals/{withdrawalId}/photos';
const NURSERY_WITHDRAWAL_ENDPOINT = '/api/v1/nursery/withdrawals/{withdrawalId}';
const NURSERY_WITHDRAWAL_LIST_PHOTOS_ENDPOINT = '/api/v1/nursery/withdrawals/{withdrawalId}/photos';
const UNDO_WITHDRAWAL_ENDPOINT = '/api/v1/nursery/withdrawals/{withdrawalId}/undo';

/**
 * Exported types
 */
export type BatchWithdrawalData = {
  withdrawal: NurseryWithdrawal | null;
};
export type PhotoId = {
  photoId: number | null;
};
export type NurseryWithdrawalData = {
  withdrawal?: NurseryWithdrawal;
  delivery?: Delivery;
  batches?: Batch[];
};
export type NurseryWithdrawalListPhotoIds = {
  photoIds?: { id: number }[];
};

export type CreateNurseryWithdrawalRequestPayload =
  paths[typeof BATCH_WITHDRAWALS_ENDPOINT]['post']['requestBody']['content']['application/json'];

type GetNurseryWithdrawalResponsePayload =
  paths[typeof NURSERY_WITHDRAWAL_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type GetNurseryWithdrawalListPhotosResponsePayload =
  paths[typeof NURSERY_WITHDRAWAL_LIST_PHOTOS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

/**
 * Create a batch withdrawal
 */
const createBatchWithdrawal = async (
  createNurseryWithdrawalRequestPayload: CreateNurseryWithdrawalRequestPayload
): Promise<Response & BatchWithdrawalData> => {
  const response: Response = await HttpService.root(BATCH_WITHDRAWALS_ENDPOINT).post({
    entity: createNurseryWithdrawalRequestPayload,
  });

  return {
    ...response,
    withdrawal: response?.data?.withdrawal ?? null,
  };
};
/**
 * Upload multiple photos for a batch withdrawal
 */
const uploadWithdrawalPhotos = async (
  withdrawalId: number,
  photos: File[]
): Promise<((Response & PhotoId) | string)[]> => {
  const url = WITHDRAWAL_PHOTOS_ENDPOINT.replace('{withdrawalId}', withdrawalId.toString());
  return PhotoService.uploadPhotos(url, photos);
};

export type NurseryWithdrawalsSearchResponseElement = {
  id: string;
  delivery_id: string;
  withdrawnDate: string;
  purpose: string;
  facility_name: string;
  destinationName: string;
  totalWithdrawn: string;
  hasReassignments: string;
  batchWithdrawals: {
    batch_project_id: string;
    batch_project_name: string;
    batch_species_scientificName: string;
    destinationBatchProjectName: string;
  }[];
};

const NURSERY_WITHDRAWALS_PREFIX = 'nurseryWithdrawals';

export type NurseryWithdrawalsSearchParams = {
  organizationId: number;
  searchCriteria: SearchNodePayload[];
  sortOrder?: SearchSortOrder;
  limit: number;
  offset: number;
};

const listNurseryWithdrawals = async (
  organizationId: number,
  searchCriteria: SearchNodePayload[],
  sortOrder?: SearchSortOrder,
  limit: number = 1000,
  offset: number = 0
): Promise<SearchResponseElement[] | null> => {
  const createdTimeOrder = { direction: 'Ascending', field: 'createdTime' } as SearchSortOrder;
  const searchParams: SearchRequestPayload = {
    prefix: NURSERY_WITHDRAWALS_PREFIX,
    fields: [
      'id',
      'createdTime',
      'delivery_id',
      'withdrawnDate',
      'purpose',
      'purpose(raw)',
      'facility_name',
      'destinationName',
      'substratumNames',
      'totalWithdrawn',
      'totalWithdrawn(raw)',
      'hasReassignments',
      'batchWithdrawals.batch_project_id',
      'batchWithdrawals.batch_project_name',
      'batchWithdrawals.batch_species_scientificName',
      'batchWithdrawals.destinationBatchProjectName',
      'undoesWithdrawalId',
      'undoneByWithdrawalId',
      'undoesWithdrawalDate',
    ],
    search: SearchService.convertToSearchNodePayload(searchCriteria, organizationId),
    sortOrder: sortOrder ? [sortOrder, createdTimeOrder] : [{ field: 'id', direction: 'Ascending' }],
    count: limit,
    cursor: offset.toString(),
  };

  const data: NurseryWithdrawalsSearchResponseElement[] | null = await SearchService.search(searchParams);
  if (data) {
    return data.map((datum) => {
      const { batchWithdrawals, ...remaining } = datum;

      const deletedSpecies = [{ batch_species_scientificName: strings.DELETED_SPECIES }];
      // replace batchWithdrawals with species_scientificNames, which is an array of species names
      const speciesScientificNames = new Set(
        (batchWithdrawals || deletedSpecies).map((batchWithdrawal) => batchWithdrawal.batch_species_scientificName)
      );

      const projectNames = batchWithdrawals
        ? Array.from(
            new Set(
              batchWithdrawals
                .flatMap((batchWithdrawal) => [
                  batchWithdrawal.batch_project_name,
                  batchWithdrawal.destinationBatchProjectName,
                ])
                .filter((name) => name !== undefined)
            )
          ).sort()
        : [];

      return {
        ...remaining,
        speciesScientificNames: Array.from(speciesScientificNames).sort(),
        project_names: projectNames,
      };
    });
  }
  return null;
};

export type NurseryWithdrawalsCountParams = {
  organizationId: number;
  searchCriteria: SearchNodePayload[];
};

const countNurseryWithdrawals = async (
  organizationId: number,
  searchCriteria: SearchNodePayload[]
): Promise<number | null> => {
  const searchParams: SearchRequestPayload = {
    prefix: NURSERY_WITHDRAWALS_PREFIX,
    fields: [],
    search: SearchService.convertToSearchNodePayload(searchCriteria, organizationId),
    count: 0,
  };

  return await SearchService.searchCount(searchParams);
};

/**
 * Check if an org has nursery withdrawals
 */
const hasNurseryWithdrawals = async (organizationId: number): Promise<boolean> => {
  const searchParams: SearchRequestPayload = {
    prefix: NURSERY_WITHDRAWALS_PREFIX,
    fields: ['id'],
    search: SearchService.convertToSearchNodePayload({}, organizationId),
    count: 1,
  };

  const response = await SearchService.search(searchParams);
  return response !== null && response !== undefined && response.length > 0;
};

/**
 * Get a nursery withdrawal by id
 */
const getNurseryWithdrawal = async (withdrawalId: number): Promise<Response & NurseryWithdrawalData> => {
  const response: Response & NurseryWithdrawalData = await HttpService.root(NURSERY_WITHDRAWAL_ENDPOINT).get<
    GetNurseryWithdrawalResponsePayload,
    NurseryWithdrawalData
  >(
    {
      urlReplacements: {
        '{withdrawalId}': withdrawalId.toString(),
      },
    },
    (data) => ({
      withdrawal: data?.withdrawal,
      batches: data?.batches,
      delivery: data?.delivery,
    })
  );

  return response;
};

/**
 * Get withdrawal photos list
 */
const getWithdrawalPhotosList = async (withdrawalId: number): Promise<Response & NurseryWithdrawalListPhotoIds> => {
  const response: Response & NurseryWithdrawalListPhotoIds = await HttpService.root(
    NURSERY_WITHDRAWAL_LIST_PHOTOS_ENDPOINT
  ).get<GetNurseryWithdrawalListPhotosResponsePayload, NurseryWithdrawalListPhotoIds>(
    {
      urlReplacements: {
        '{withdrawalId}': withdrawalId.toString(),
      },
    },
    (data) => ({ photoIds: data?.photos })
  );

  return response;
};

/**
 * Get Filter Options
 */
const getFilterOptions = async (organizationId: number): Promise<FieldOptionsMap> => {
  const searchParams: SearchRequestPayload = {
    prefix: NURSERY_WITHDRAWALS_PREFIX,
    fields: [
      'purpose',
      'facility_name',
      'destinationName',
      'substratumNames',
      'batchWithdrawals.batch_species_scientificName',
    ],
    search: SearchService.convertToSearchNodePayload({}, organizationId),
    count: 0,
  };

  return ((await SearchService.searchValues(searchParams)) ?? {}) as FieldOptionsMap;
};

const undoNurseryWithdrawal = async (withdrawalId: number): Promise<Response> => {
  const serverResponse: Response = await HttpService.root(UNDO_WITHDRAWAL_ENDPOINT).post({
    urlReplacements: {
      '{withdrawalId}': withdrawalId.toString(),
    },
  });

  return serverResponse;
};

/**
 * Exported functions
 */
const NurseryWithdrawalService = {
  createBatchWithdrawal,
  countNurseryWithdrawals,
  uploadWithdrawalPhotos,
  listNurseryWithdrawals,
  hasNurseryWithdrawals,
  getNurseryWithdrawal,
  getWithdrawalPhotosList,
  getFilterOptions,
  undoNurseryWithdrawal,
};

export default NurseryWithdrawalService;
