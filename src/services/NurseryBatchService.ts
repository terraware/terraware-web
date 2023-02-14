import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from './HttpService';
import { Batch, CreateBatchRequestPayload } from 'src/types/Batch';
import SearchService, { SearchNodePayload, SearchResponseElement, SearchSortOrder } from './SearchService';

/**
 * Nursery related services
 */

const BATCHES_ENDPOINT = '/api/v1/nursery/batches';
const BATCH_ID_ENDPOINT = '/api/v1/nursery/batches/{id}';
const BATCH_QUANTITIES_ENDPOINT = '/api/v1/nursery/batches/{id}/quantities';

const DEFAULT_BATCH_FIELDS = [
  'id',
  'batchNumber',
  'germinatingQuantity',
  'notReadyQuantity',
  'readyQuantity',
  'totalQuantity',
  'totalQuantityWithdrawn',
  'germinatingQuantity(raw)',
  'notReadyQuantity(raw)',
  'readyQuantity(raw)',
  'totalQuantity(raw)',
  'totalQuantityWithdrawn(raw)',
  'facility_id',
  'facility_name',
  'readyByDate',
  'addedDate',
  'version',
  'accession_id',
  'accession_accessionNumber',
  'notes',
];

export type BatchId = {
  batchId: number | null;
};
export type BatchData = {
  batch: Batch | null;
};

export type UpdateBatchRequestPayload =
  paths[typeof BATCH_ID_ENDPOINT]['put']['requestBody']['content']['application/json'];
export type UpdateBatchQuantitiesRequestPayload =
  paths[typeof BATCH_QUANTITIES_ENDPOINT]['put']['requestBody']['content']['application/json'];

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
const getBatches = async (organizationId: number, batchIds: number[]): Promise<SearchResponseElement[] | null> => {
  const searchResponse = await SearchService.search({
    prefix: 'batches',
    search: SearchService.convertToSearchNodePayload(
      {
        children: {
          operation: 'field',
          field: 'id',
          values: batchIds.map((id) => id.toString()),
        },
      },
      organizationId
    ),
    fields: [...DEFAULT_BATCH_FIELDS, 'species_id', 'species_scientificName', 'species_commonName'],
    count: 1000,
  });

  return searchResponse;
};

/**
 * Get batch ids for species
 */
const getBatchIdsForSpecies = async (
  organizationId: number,
  speciesIds: number[]
): Promise<SearchResponseElement[] | null> => {
  const searchResponse = await SearchService.search({
    prefix: 'batches',
    search: SearchService.convertToSearchNodePayload(
      {
        children: {
          operation: 'field',
          field: 'species_id',
          values: speciesIds.map((id) => id.toString()),
        },
      },
      organizationId
    ),
    fields: ['id'],
    count: 1000,
  });

  return searchResponse;
};

/**
 * Get batches for a single species by it's id
 */
const getBatchesForSpeciesById = async (
  organizationId: number,
  speciesId: number,
  searchFields: SearchNodePayload[],
  searchSortOrder?: SearchSortOrder
): Promise<SearchResponseElement[] | null> => {
  const searchParams = {
    prefix: 'batches',
    search: {
      operation: 'and',
      children: [
        {
          operation: 'field',
          field: 'species_id',
          values: [speciesId.toString()],
        },
        {
          operation: 'field',
          field: 'species_organization_id',
          values: [organizationId.toString()],
          type: 'Exact',
        },
      ],
    },
    fields: DEFAULT_BATCH_FIELDS,
    sortOrder: [
      searchSortOrder ?? {
        field: 'batchNumber',
      },
    ],
    count: 1000,
  };

  if (searchFields.length) {
    const children: any = searchParams.search.children;
    children.push({
      operation: 'and',
      children: searchFields,
    });
  }

  return await SearchService.search(searchParams);
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
 * Exported functions
 */
const NurseryBatchService = {
  createBatch,
  getBatch,
  getBatches,
  getBatchIdsForSpecies,
  getBatchesForSpeciesById,
  deleteBatch,
  updateBatch,
  updateBatchQuantities,
};

export default NurseryBatchService;
