import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from './HttpService';
import { Batch, NurseryWithdrawal, CreateBatchRequestPayload } from 'src/types/Batch';
import SearchService, { SearchResponseElement } from './SearchService';

/**
 * Nursery related services
 */

const BATCHES_ENDPOINT = '/api/v1/nursery/batches';
const BATCH_ID_ENDPOINT = '/api/v1/nursery/batches/{id}';
const BATCH_QUANTITIES_ENDPOINT = '/api/v1/nursery/batches/{id}/quantities';
const BATCH_WITHDRAWALS_ENDPOINT = '/api/v1/nursery/withdrawals';
const WITHDRAWAL_PHOTOS_ENDPOINT = '/api/v1/nursery/withdrawals/{withdrawalId}/photos';

export type BatchId = {
  batchId: number | null;
};
export type BatchData = {
  batch: Batch | null;
};
export type BatchWithdrawalData = {
  withdrawal: NurseryWithdrawal | null;
};
export type PhotoId = {
  photoId: number | null;
};

export type UpdateBatchRequestPayload =
  paths[typeof BATCH_ID_ENDPOINT]['put']['requestBody']['content']['application/json'];
export type UpdateBatchQuantitiesRequestPayload =
  paths[typeof BATCH_QUANTITIES_ENDPOINT]['put']['requestBody']['content']['application/json'];
export type CreateNurseryWithdrawalRequestPayload =
  paths[typeof BATCH_WITHDRAWALS_ENDPOINT]['post']['requestBody']['content']['application/json'];

type GetBatchResponsePayload = paths[typeof BATCH_ID_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const httpBatch = HttpService.root(BATCH_ID_ENDPOINT);

/**
 * Create a batch
 */
const createBatch = async (batch: CreateBatchRequestPayload): Promise<Response & BatchId> => {
  const response: Response = await HttpService.root(BATCHES_ENDPOINT).post({ entity: batch });

  return {
    ...response,
    batchId: response?.data?.batch?.id ?? null,
  };
};

/**
 * Get a batch by id
 */
const getBatch = async (batchId: number): Promise<Response & BatchData> => {
  const response: Response & BatchData = await httpBatch.get<GetBatchResponsePayload, BatchData>(
    {
      urlReplacements: {
        '{id}': batchId.toString(),
      },
    },
    (data) => ({ batch: data?.batch ?? null })
  );

  return response;
};

/**
 * Get batches by list of ids
 */
const getBatches = async (batchIds: number[]): Promise<SearchResponseElement[] | null> => {
  const searchResponse = await SearchService.search({
    prefix: 'batches',
    search: {
      operation: 'and',
      children: [
        {
          operation: 'field',
          field: 'id',
          values: batchIds.map((id) => id.toString()),
        },
      ],
    },
    fields: [
      'id',
      'batchNumber',
      'germinatingQuantity',
      'notReadyQuantity',
      'readyQuantity',
      'totalQuantity',
      'totalQuantityWithdrawn',
      'facility_id',
      'facility_name',
      'readyByDate',
      'addedDate',
      'version',
      'accession_id',
      'accession_accessionNumber',
      'notes',
      'species_id',
      'species_scientificName',
      'species_commonName',
    ],
    count: 1000,
  });

  return searchResponse;
};

/**
 * Get batches for species
 */
const getBatchesForSpecies = async (speciesIds: number[]): Promise<SearchResponseElement[] | null> => {
  const searchResponse = await SearchService.search({
    prefix: 'batches',
    search: {
      operation: 'and',
      children: [
        {
          operation: 'field',
          field: 'species_id',
          values: speciesIds.map((id) => id.toString()),
        },
      ],
    },
    fields: ['id'],
    count: 1000,
  });

  return searchResponse;
};

/**
 * Delete a batch by id
 */
const deleteBatch = async (batchId: number): Promise<Response> => {
  return await httpBatch.delete({
    urlReplacements: {
      '{id}': batchId.toString(),
    },
  });
};

/**
 * Update a batch by id
 */
export const updateBatch = async (batch: Batch): Promise<Response & BatchData> => {
  const entity: UpdateBatchRequestPayload = {
    notes: batch.notes,
    readyByDate: batch.readyByDate,
    version: batch.version,
  };

  const response: Response = await httpBatch.put({
    entity,
    urlReplacements: {
      '{id}': batch.id.toString(),
    },
  });

  return {
    ...response,
    batch: response?.data?.batch ?? null,
  };
};

/**
 * Update a batch quantity
 */
const updateBatchQuantities = async (batch: Batch): Promise<Response> => {
  const entity: UpdateBatchQuantitiesRequestPayload = {
    germinatingQuantity: batch.germinatingQuantity,
    notReadyQuantity: batch.notReadyQuantity,
    readyQuantity: batch.readyQuantity,
    version: batch.version,
  };

  return await HttpService.root(BATCH_QUANTITIES_ENDPOINT).put({
    entity,
    urlReplacements: {
      '{id}': batch.id.toString(),
    },
  });
};

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
 * Exported functions
 */
const NurseryBatchService = {
  createBatch,
  getBatch,
  getBatches,
  getBatchesForSpecies,
  deleteBatch,
  updateBatch,
  updateBatchQuantities,
  createBatchWithdrawal,
  uploadWithdrawalPhoto,
  uploadWithdrawalPhotos,
};

export default NurseryBatchService;
