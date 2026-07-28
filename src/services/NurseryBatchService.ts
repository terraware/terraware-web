import {
  FieldNodePayload,
  SearchNodePayload,
  SearchRequestPayload,
  SearchResponseElement,
  SearchSortOrder,
} from 'src/types/Search';
import { parseSearchTerm } from 'src/utils/search';

import SearchService from './SearchService';

/**
 * Nursery related services
 */

const DEFAULT_BATCH_FIELDS = [
  'accession_id',
  'accession_accessionNumber',
  'addedDate',
  'batchNumber',
  'facility_id',
  'facility_name',
  'germinatingQuantity',
  'germinatingQuantity(raw)',
  'germinationStartedDate',
  'hardeningOffQuantity',
  'hardeningOffQuantity(raw)',
  'id',
  'notes',
  'activeGrowthQuantity',
  'activeGrowthQuantity(raw)',
  'project_name',
  'project_id',
  'readyByDate',
  'readyQuantity',
  'readyQuantity(raw)',
  'seedsSownDate',
  'species_scientificName',
  'species_commonName',
  'subLocations.subLocation_id',
  'subLocations.subLocation_name',
  'totalQuantity',
  'totalQuantityWithdrawn',
  'totalQuantity(raw)',
  'totalQuantityWithdrawn(raw)',
  'version',
];

const REPORT_BATCH_FIELDS = [
  'batchNumber',
  'species_scientificName',
  'species_commonName',
  'facility_name',
  'germinatingQuantity',
  'hardeningOffQuantity',
  'activeGrowthQuantity',
  'readyQuantity',
  'totalQuantity',
];

export type NurseryBatchesReportSearchResponseElement = SearchResponseElement & {
  batchNumber: string;
  species_scientificName: string;
  species_commonName: string;
  facility_name: string;
  germinatingQuantity: string;
  'germinatingQuantity(raw)': number;
  hardeningOffQuantity: string;
  'hardeningOffQuantity(raw)': number;
  activeGrowthQuantity: string;
  'activeGrowthQuantity(raw)': number;
  readyQuantity: string;
  'readyQuantity(raw)': number;
  totalQuantity: string;
  'totalQuantity(raw)': number;
};

const EXPORT_BATCH_FIELDS = [
  'batchNumber',
  'species_scientificName',
  'seedsSownDate',
  'germinatingQuantity',
  'germinationStartedDate',
  'hardeningOffQuantity',
  'activeGrowthQuantity',
  'readyByDate',
  'readyQuantity',
  'totalQuantity',
  'facility_name',
  'addedDate',
];

const NURSERY_BATCHES_FIELDS = [...DEFAULT_BATCH_FIELDS, 'species_id', 'species_scientificName', 'species_commonName'];

export type NurseryBatchesSearchResponseElement = SearchResponseElement & {
  accession_id?: string;
  accession_accessionNumber?: string;
  addedDate: string;
  batchNumber: string;
  facility_id: string;
  germinatingQuantity: string;
  'germinatingQuantity(raw)': number;
  germinationStartedDate: string;
  hardeningOffQuantity: string;
  'hardeningOffQuantity(raw)': number;
  id: string;
  notes: string;
  activeGrowthQuantity: string;
  'activeGrowthQuantity(raw)': number;
  readyQuantity: string;
  'readyQuantity(raw)': number;
  readyByDate: string;
  seedsSownDate: string;
  species_id: string;
  species_scientificName: string;
  species_commonName: string;
  subLocations?: { subLocation_id: string; subLocation_name: string }[];
  totalQuantity: string;
  'totalQuantity(raw)': number;
  version: string;
  project_name?: string;
};

/**
 * Get batches by list of ids
 */
const getBatches = async (
  organizationId: number,
  batchIds: number[]
): Promise<NurseryBatchesSearchResponseElement[] | null> => {
  return await SearchService.search({
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
    fields: NURSERY_BATCHES_FIELDS,
    count: 1000,
  });
};

export type SearchResponseBatches = NurseryBatchesSearchResponseElement | NurseryBatchesReportSearchResponseElement;

/**
 * Get all batches
 */
const getAllBatches = async (
  organizationId: number,
  searchSortOrder?: SearchSortOrder,
  facilityIds?: number[],
  subLocationIds?: number[],
  query?: string,
  isCsvExport?: boolean,
  searchFields?: SearchNodePayload[]
): Promise<SearchResponseBatches[] | null> => {
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
    fields: isCsvExport ? REPORT_BATCH_FIELDS : NURSERY_BATCHES_FIELDS,
    sortOrder: [
      searchSortOrder ?? {
        field: 'batchNumber',
      },
    ],
    count: 0,
  };

  if (facilityIds && facilityIds.length > 0) {
    params.search.children.push({
      operation: 'field',
      field: 'facility_id',
      type: 'Exact',
      values: facilityIds.map((id) => id.toString()),
    } as SearchNodePayload);
  }

  if (subLocationIds && subLocationIds.length > 0) {
    params.search.children.push({
      operation: 'field',
      field: 'subLocations.subLocation_id',
      type: 'Exact',
      values: subLocationIds.map((id) => id.toString()),
    } as SearchNodePayload);
  }

  if (searchFields) {
    for (const field of searchFields) {
      params.search.children.push(field);
    }
  }

  if (query) {
    const { type, values } = parseSearchTerm(query, 'PartialOrFuzzy');
    const searchValueChildren: FieldNodePayload[] = [];
    searchValueChildren.push({
      operation: 'field',
      field: 'batchNumber',
      type,
      values,
    });

    searchValueChildren.push({
      operation: 'field',
      field: 'species_scientificName',
      type,
      values,
    });

    searchValueChildren.push({
      operation: 'field',
      field: 'species_commonName',
      type,
      values,
    });

    searchValueChildren.push({
      operation: 'field',
      field: 'facility_name',
      type,
      values,
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
  getBatches,
  getAllBatches,
  getBatchIdsForSpecies,
  getBatchesForSpeciesById,
  exportBatchesForSpeciesById,
  getBatchesForNursery,
};

export default NurseryBatchService;
