import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from './HttpService';
import { Batch, NurseryWithdrawal } from 'src/types/Batch';
import { Delivery } from 'src/types/Tracking';
import SearchService, {
  SearchCriteria,
  SearchRequestPayload,
  SearchResponseElement,
  SearchSortOrder,
} from './SearchService';
import strings from 'src/strings';

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
 * Upload a photo for a batch withdrawal
 */
const uploadWithdrawalPhoto = async (withdrawalId: number, photo: File): Promise<Response & PhotoId> => {
  const entity = new FormData();
  entity.append('file', photo);

  const headers = {
    'content-type': 'multipart/form-data',
  };

  const response: Response = await HttpService.root(WITHDRAWAL_PHOTOS_ENDPOINT).post({
    entity,
    headers,
    urlReplacements: {
      '{withdrawalId}': withdrawalId.toString(),
    },
  });

  return {
    ...response,
    photoId: response?.data?.id ?? null,
  };
};

/**
 * Upload multiple photos for a batch withdrawal
 */
const uploadWithdrawalPhotos = async (
  withdrawalId: number,
  photos: File[]
): Promise<((Response & PhotoId) | string)[]> => {
  const uploadPhotoPromises = photos.map((photo) => uploadWithdrawalPhoto(withdrawalId, photo));
  try {
    const promiseResponses = await Promise.allSettled(uploadPhotoPromises);
    return promiseResponses.map((response) => {
      if (response.status === 'rejected') {
        // tslint:disable-next-line: no-console
        console.error(response.reason);
        return response.reason;
      } else {
        return response.value as Response & PhotoId;
      }
    });
  } catch (e) {
    // swallow error
  }

  return [];
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
    search: SearchService.convertToSearchNodePayload([], organizationId),
    sortOrder: [{ field: 'id', direction: 'Ascending' }],
    count: 1000,
  };

  const data = await SearchService.search(searchParams);
  const map: FieldOptionsMap = {};
  if (data) {
    for (const d of data) {
      const keys = Object.keys(d);
      for (const k of keys) {
        if (k === 'batchWithdrawals') {
          // flatten and add species names
          const newKey = 'batchWithdrawals.batch_species_scientificName';
          if (!Object.keys(map).includes(newKey)) {
            map[newKey] = { partial: false, values: [] };
          }
          const speciesScientificNames = (d[k] as any[]).map(
            (batchWithdrawal) => batchWithdrawal.batch_species_scientificName
          );
          map[newKey].values.push(...speciesScientificNames);
        } else {
          // add options
          if (!Object.keys(map).includes(k)) {
            map[k] = { partial: false, values: [] };
          }
          map[k].values.push(d[k] as string);
        }
      }
    }
  }

  return map;
};

/**
 * Exported functions
 */
const NurseryWithdrawalService = {
  createBatchWithdrawal,
  uploadWithdrawalPhoto,
  uploadWithdrawalPhotos,
  listNurseryWithdrawals,
  hasNurseryWithdrawals,
  getNurseryWithdrawal,
  getWithdrawalPhotosList,
  getFilterOptions,
};

export default NurseryWithdrawalService;
