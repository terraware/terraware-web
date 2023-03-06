import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from './HttpService';
import { Batch, NurseryWithdrawal } from 'src/types/Batch';
import { Delivery } from 'src/types/Tracking';
import SearchService, { SearchRequestPayload } from './SearchService';
import { SearchCriteria, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import strings from 'src/strings';
import PhotoService from './PhotoService';

/**
 * Nursery withdrawal related services
 */

const BATCH_WITHDRAWALS_ENDPOINT = '/api/v1/nursery/withdrawals';
const WITHDRAWAL_PHOTOS_ENDPOINT = '/api/v1/nursery/withdrawals/{withdrawalId}/photos';
const NURSERY_WITHDRAWAL_ENDPOINT = '/api/v1/nursery/withdrawals/{withdrawalId}';
const NURSERY_WITHDRAWAL_LIST_PHOTOS_ENDPOINT = '/api/v1/nursery/withdrawals/{withdrawalId}/photos';

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
export type FieldOptionsMap = { [key: string]: { partial: boolean; values: (string | null)[] } };

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

/**
 * List nursery withdrawals
 */
const listNurseryWithdrawals = async (
  organizationId: number,
  searchCriteria: SearchCriteria,
  sortOrder?: SearchSortOrder
): Promise<SearchResponseElement[] | null> => {
  const searchParams: SearchRequestPayload = {
    prefix: 'nurseryWithdrawals',
    fields: [
      'id',
      'delivery_id',
      'withdrawnDate',
      'purpose',
      'facility_name',
      'destinationName',
      'plotNames',
      'batchWithdrawals.batch_species_scientificName',
      'totalWithdrawn',
      'hasReassignments',
    ],
    search: SearchService.convertToSearchNodePayload(searchCriteria, organizationId),
    sortOrder: sortOrder ? [sortOrder] : [{ field: 'id', direction: 'Ascending' }],
    count: 1000,
  };
  const deletedSpecies = [{ batch_species_scientificName: strings.DELETED_SPECIES }];

  const data = await SearchService.search(searchParams);
  if (data) {
    return data.map((datum) => {
      const { batchWithdrawals, ...remaining } = datum;
      const speciesScientificNames = ((batchWithdrawals || deletedSpecies) as any[]).map(
        (batchWithdrawal) => batchWithdrawal.batch_species_scientificName
      );
      // replace batchWithdrawals with species_scientificNames, which is an array of species names
      const deDupedNames = new Set(speciesScientificNames);
      return {
        ...remaining,
        speciesScientificNames: Array.from(deDupedNames).sort(),
      };
    });
  }
  return null;
};

/**
 * Check if an org has nursery withdrawals
 */
const hasNurseryWithdrawals = async (organizationId: number): Promise<boolean> => {
  const searchParams: SearchRequestPayload = {
    prefix: 'nurseryWithdrawals',
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
    prefix: 'nurseryWithdrawals',
    fields: [
      'id',
      'purpose',
      'facility_name',
      'destinationName',
      'plotNames',
      'batchWithdrawals.batch_species_scientificName',
    ],
    search: SearchService.convertToSearchNodePayload({}, organizationId),
    sortOrder: [{ field: 'id', direction: 'Ascending' }],
    count: 1000,
  };

  const data = await SearchService.search(searchParams);
  return (data ?? []).reduce((acc, d) => {
    return Object.keys(d).reduce((innerAcc, k) => {
      const isBatchWithdrawals = k === 'batchWithdrawals';
      const newKey = isBatchWithdrawals ? 'batchWithdrawals.batch_species_scientificName' : k;
      if (!innerAcc[newKey]) {
        innerAcc[newKey] = { partial: false, values: [] };
      }
      const value = isBatchWithdrawals
        ? (d[k] as any[]).map((batchWithdrawal) => batchWithdrawal.batch_species_scientificName)
        : d[k];
      if (Array.isArray(value)) {
        (innerAcc[newKey] as Record<string, any>).values.push(...value);
      } else {
        (innerAcc[newKey] as Record<string, any>).values.push(value);
      }
      return innerAcc;
    }, acc);
  }, {}) as FieldOptionsMap;
};

/**
 * Exported functions
 */
const NurseryWithdrawalService = {
  createBatchWithdrawal,
  uploadWithdrawalPhotos,
  listNurseryWithdrawals,
  hasNurseryWithdrawals,
  getNurseryWithdrawal,
  getWithdrawalPhotosList,
  getFilterOptions,
};

export default NurseryWithdrawalService;
