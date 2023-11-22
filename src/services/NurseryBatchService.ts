import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from './HttpService';
import { Batch, BatchHistoryItem, CreateBatchRequestPayload } from 'src/types/Batch';
import SearchService from './SearchService';
import {
  FieldNodePayload,
  SearchNodePayload,
  SearchRequestPayload,
  SearchResponseElement,
  SearchSortOrder,
} from 'src/types/Search';
import { getPromisesResponse } from './utils';
import PhotoService from './PhotoService';
import { User } from 'src/types/User';
import { getUserDisplayName } from 'src/utils/user';

/**
 * Nursery related services
 */

const BATCHES_ENDPOINT = '/api/v1/nursery/batches';
const BATCH_CHANGE_STATUSES_ENDPOINT = '/api/v1/nursery/batches/{id}/changeStatuses';
const BATCH_ID_ENDPOINT = '/api/v1/nursery/batches/{id}';
const BATCH_QUANTITIES_ENDPOINT = '/api/v1/nursery/batches/{id}/quantities';
const LIST_BATCH_PHOTOS_ENDPOINT = '/api/v1/nursery/batches/{batchId}/photos';
const BATCH_HISTORY_ENDPOINT = '/api/v1/nursery/batches/{batchId}/history';
export const BATCH_PHOTO_ENDPOINT = '/api/v1/nursery/batches/{batchId}/photos/{photoId}';

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

const REPORT_BATCH_FIELDS = [
  'batchNumber',
  'species_scientificName',
  'species_commonName',
  'facility_name',
  'germinatingQuantity',
  'notReadyQuantity',
  'readyQuantity',
  'totalQuantity',
];

const EXPORT_BATCH_FIELDS = [
  'batchNumber',
  'species_scientificName',
  'germinatingQuantity',
  'notReadyQuantity',
  'readyQuantity',
  'totalQuantity',
  'facility_name',
  'addedDate',
];

const NURSERY_BATCHES_FIELDS = [
  'accession_id',
  'accession_accessionNumber',
  'addedDate',
  'batchNumber',
  'facility_id',
  'germinatingQuantity',
  'germinatingQuantity(raw)',
  'id',
  'notes',
  'notReadyQuantity',
  'notReadyQuantity(raw)',
  'readyQuantity',
  'readyQuantity(raw)',
  'readyByDate',
  'species_id',
  'species_scientificName',
  'species_commonName',
  'subLocations.subLocation_id',
  'subLocations.subLocation_name',
  'totalQuantity',
  'totalQuantity(raw)',
  'version',
];

export type NurseryBatchesSearchResponseElement = SearchResponseElement & {
  accession_id?: string;
  accession_accessionNumber?: string;
  addedDate: string;
  batchNumber: string;
  facility_id: string;
  germinatingQuantity: string;
  'germinatingQuantity(raw)': string;
  id: string;
  notes: string;
  notReadyQuantity: string;
  'notReadyQuantity(raw)': string;
  readyQuantity: string;
  'readyQuantity(raw)': string;
  readyByDate: string;
  species_id: string;
  species_scientificName: string;
  species_commonName: string;
  subLocations?: { subLocation_id: string; subLocation_name: string }[];
  totalQuantity: string;
  'totalQuantity(raw)': string;
  totalWithdrawn: string;
  version: string;
};

export type BatchId = {
  batchId: number | null;
};
export type BatchData = {
  batch: Batch | null;
};
export type BatchHistoryData = {
  history: BatchHistoryItem[] | null;
};
export type BatchPhotosIds = {
  photoIds?: { id: number }[];
};

type PhotoId = {
  photoId: number | null;
};

export type ChangeBatchStatusesRequestPayload =
  paths[typeof BATCH_CHANGE_STATUSES_ENDPOINT]['post']['requestBody']['content']['application/json'];
export type UpdateBatchRequestPayload =
  paths[typeof BATCH_ID_ENDPOINT]['put']['requestBody']['content']['application/json'];
export type UpdateBatchQuantitiesRequestPayload =
  paths[typeof BATCH_QUANTITIES_ENDPOINT]['put']['requestBody']['content']['application/json'];

type GetBatchResponsePayload = paths[typeof BATCH_ID_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type GetBatchHistoryResponsePayload =
  paths[typeof BATCH_HISTORY_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type GetBatchListPhotosResponsePayload =
  paths[typeof LIST_BATCH_PHOTOS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const httpBatch = HttpService.root(BATCH_ID_ENDPOINT);
const httpBatchHistory = HttpService.root(BATCH_HISTORY_ENDPOINT);
const httpBatchPhoto = HttpService.root(BATCH_PHOTO_ENDPOINT);

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
          type: 'Exact',
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
 * Get all batches
 */
const getAllBatches = async (
  organizationId: number,
  searchSortOrder?: SearchSortOrder,
  facilityIds?: number[],
  query?: string,
  isCsvExport?: boolean
): Promise<SearchResponseElement[] | null> => {
  const params: SearchRequestPayload = {
    prefix: 'batches',
    search: {
      operation: 'and',
      children: [
        {
          operation: 'field',
          field: 'facility_organization_id',
          type: 'Exact',
          values: [organizationId.toString()],
        },
      ],
    },
    fields: isCsvExport
      ? [...REPORT_BATCH_FIELDS]
      : [...DEFAULT_BATCH_FIELDS, 'species_id', 'species_scientificName', 'species_commonName'],
    sortOrder: [
      searchSortOrder ?? {
        field: 'batchNumber',
      },
    ],
    count: 1000,
  };

  if (facilityIds && facilityIds.length > 0) {
    params.search.children.push({
      operation: 'field',
      field: 'facility_id',
      type: 'Exact',
      values: facilityIds.map((id) => id.toString()),
    } as SearchNodePayload);
  }

  if (query) {
    const searchValueChildren: FieldNodePayload[] = [];
    searchValueChildren.push({
      operation: 'field',
      field: 'batchNumber',
      type: 'Fuzzy',
      values: [query],
    });

    searchValueChildren.push({
      operation: 'field',
      field: 'species_scientificName',
      type: 'Fuzzy',
      values: [query],
    });

    searchValueChildren.push({
      operation: 'field',
      field: 'species_commonName',
      type: 'Fuzzy',
      values: [query],
    });

    searchValueChildren.push({
      operation: 'field',
      field: 'facility_name',
      type: 'Fuzzy',
      values: [query],
    });

    params.search.children.push({
      operation: 'or',
      children: searchValueChildren,
    } as SearchNodePayload);
  }

  return isCsvExport ? await SearchService.searchCsv(params) : await SearchService.search(params);
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
          type: 'Exact',
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
 * Get batches for a single species by its id
 */
const getBatchesForSpeciesById = async (
  organizationId: number,
  speciesId: number,
  searchFields: SearchNodePayload[],
  searchSortOrder?: SearchSortOrder,
  isExport?: boolean
): Promise<any> => {
  const searchParams: SearchRequestPayload = {
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
    fields: isExport ? EXPORT_BATCH_FIELDS : DEFAULT_BATCH_FIELDS,
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

  return isExport ? await SearchService.searchCsv(searchParams) : await SearchService.search(searchParams);
};

/**
 * Export batches
 */
const exportBatchesForSpeciesById = async (
  organizationId: number,
  speciesId: number,
  searchFields: SearchNodePayload[],
  searchSortOrder?: SearchSortOrder
): Promise<any> => {
  return await getBatchesForSpeciesById(organizationId, speciesId, searchFields, searchSortOrder, true);
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
    subLocationIds: batch.subLocationIds,
    substrate: batch.substrate,
    substrateNotes: batch.substrateNotes,
    treatment: batch.treatment,
    treatmentNotes: batch.treatmentNotes,
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
 * Change the statuses of seedlings in a batch
 */
const changeBatchStatuses = async (batch: Batch, entity: ChangeBatchStatusesRequestPayload): Promise<Response> => {
  return await HttpService.root(BATCH_CHANGE_STATUSES_ENDPOINT).post({
    entity,
    urlReplacements: {
      '{id}': batch.id.toString(),
    },
  });
};

/**
 * Get withdrawal photos list
 */
const getBatchPhotosList = async (batchId: number): Promise<Response & BatchPhotosIds> => {
  const response: Response & BatchPhotosIds = await HttpService.root(LIST_BATCH_PHOTOS_ENDPOINT).get<
    GetBatchListPhotosResponsePayload,
    BatchPhotosIds
  >(
    {
      urlReplacements: {
        '{batchId}': batchId.toString(),
      },
    },
    (data) => ({ photoIds: data?.photos })
  );

  return response;
};

/**
 * Delete multiple photos for a batch
 */
const deleteBatchPhotos = async (batchId: number, photosId: number[]): Promise<(Response | null)[]> => {
  const deletePhotoPromises = photosId.map((photoId) => deleteBatchPhoto(batchId, photoId));

  return getPromisesResponse<Response>(deletePhotoPromises);
};

/**
 * delete batch file
 */
const deleteBatchPhoto = async (reportId: number, fileId: number): Promise<Response> => {
  return await httpBatchPhoto.delete({
    urlReplacements: {
      '{batchId}': reportId.toString(),
      '{photoId}': fileId.toString(),
    },
  });
};

/**
 * Upload multiple photos for a batch
 */
const uploadBatchPhotos = async (batchId: number, photos: File[]): Promise<((Response & PhotoId) | string)[]> => {
  const url = LIST_BATCH_PHOTOS_ENDPOINT.replace('{batchId}', batchId.toString());
  return PhotoService.uploadPhotos(url, photos);
};

const getBatchHistory = async (
  batchId: number,
  search?: string,
  filter?: Record<string, any>,
  users?: Record<number, User>
): Promise<Response & BatchHistoryData> => {
  const response: Response & BatchHistoryData = await httpBatchHistory.get<
    GetBatchHistoryResponsePayload,
    BatchHistoryData
  >(
    {
      urlReplacements: {
        '{batchId}': batchId.toString(),
      },
    },
    (data) => {
      if (data) {
        let filtered = [...data.history];
        if (filter) {
          if (filter.type?.values) {
            filtered = filtered.filter((ev) => {
              return filter.type.values.indexOf(ev.type) > -1;
            });
          }
          if (filter.editedByName?.values && users) {
            filtered = filtered.filter((ev) => {
              const evUserName = getUserDisplayName(users[ev.createdBy]);
              return filter.editedByName.values.indexOf(evUserName) > -1;
            });
          }
        }
        if (search && users) {
          const regex = new RegExp(search, 'i');
          filtered = filtered.filter((ev) => {
            const evUserName = getUserDisplayName(users[ev.createdBy]);
            return evUserName.match(regex);
          });
        }
        return {
          history: filtered,
        };
      }
      return { history: null };
    }
  );

  return response;
};

const getBatchesForNursery = (
  organizationId: number,
  nurseryId: number,
  searchFields?: SearchNodePayload[],
  searchSortOrder?: SearchSortOrder
): Promise<SearchResponseElement[] | null> => {
  const payload: SearchRequestPayload = {
    prefix: 'batches',
    search: {
      operation: 'and',
      children: [
        {
          operation: 'field',
          field: 'facility_id',
          values: [nurseryId],
        },
        {
          operation: 'field',
          field: 'species_organization_id',
          values: [organizationId],
        },
      ],
    },
    fields: NURSERY_BATCHES_FIELDS,
    sortOrder: [
      searchSortOrder ?? {
        field: 'batchNumber',
      },
    ],
    // TODO figure out pagination / count / etc...
    count: 1000,
  };

  if (searchFields) {
    searchFields.forEach((searchField) => payload.search.children.push(searchField));
  }

  return SearchService.search(payload);
};

/**
 * Exported functions
 */
const NurseryBatchService = {
  changeBatchStatuses,
  createBatch,
  getBatch,
  getBatches,
  getAllBatches,
  getBatchIdsForSpecies,
  getBatchesForSpeciesById,
  deleteBatch,
  updateBatch,
  updateBatchQuantities,
  exportBatchesForSpeciesById,
  getBatchPhotosList,
  deleteBatchPhotos,
  uploadBatchPhotos,
  getBatchHistory,
  getBatchesForNursery,
};

export default NurseryBatchService;
