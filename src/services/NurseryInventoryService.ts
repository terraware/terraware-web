import { paths } from 'src/api/types/generated-schema';
import { GetUploadStatusResponsePayload, UploadFileResponse } from 'src/types/File';
import { SpeciesInventorySummary } from 'src/types/Inventory';
import {
  FieldNodePayload,
  OrNodePayload,
  PrefixedSearch,
  SearchNodePayload,
  SearchRequestPayload,
  SearchResponseElement,
  SearchSortOrder,
} from 'src/types/Search';
import { parseSearchTerm } from 'src/utils/search';

import HttpService, { Response } from './HttpService';
import SearchService from './SearchService';

/**
 * Nursery related services
 */

const SPECIES_INVENTORY_SUMMARY_ENDPOINT = '/api/v1/nursery/species/{speciesId}/summary';
const INVENTORY_TEMPLATE_ENDPOINT = '/api/v1/nursery/batches/uploads/template';
const INVENTORY_UPLOAD_STATUS_ENDPOINT = '/api/v1/nursery/batches/uploads/{uploadId}';
const INVENTORY_UPLOADS_ENDPOINT = '/api/v1/nursery/batches/uploads';

/**
 * exported types
 */
export type SummaryData = {
  summary: SpeciesInventorySummary | null;
};

export type InventoryUploadTemplate = {
  template?: string;
};

export type InventoryUploadStatusDetails = {
  uploadStatus?: GetUploadStatusResponsePayload;
};

export type SearchInventoryParams = {
  organizationId: number;
  searchSortOrder?: SearchSortOrder;
  query?: string;
  facilityIds?: number[];
  subLocationIds?: number[];
  speciesIds?: number[];
  isCsvExport?: boolean;
  showEmptyBatches?: boolean;
};

type GetSummaryResponsePayload =
  paths[typeof SPECIES_INVENTORY_SUMMARY_ENDPOINT]['get']['responses'][200]['content']['application/json'];

/**
 * Get inventory summary for a species id
 */
const getSummary = async (speciesId: number | string): Promise<Response & SummaryData> => {
  const response: Response & SummaryData = await HttpService.root(SPECIES_INVENTORY_SUMMARY_ENDPOINT).get<
    GetSummaryResponsePayload,
    SummaryData
  >(
    {
      urlReplacements: {
        '{speciesId}': speciesId.toString(),
      },
    },
    (data) => ({ summary: data?.summary ?? null })
  );

  return response;
};

/**
 * Download inventory template
 */
const downloadInventoryTemplate = async (): Promise<Response & InventoryUploadTemplate> => {
  const response: Response & InventoryUploadTemplate = await HttpService.root(INVENTORY_TEMPLATE_ENDPOINT).get<
    any,
    InventoryUploadTemplate
  >({}, (data) => ({ template: data }));

  return response;
};

/**
 * Get upload status
 */
const getInventoryUploadStatus = async (uploadId: number): Promise<Response & InventoryUploadStatusDetails> => {
  const response: Response & InventoryUploadStatusDetails = await HttpService.root(
    INVENTORY_UPLOAD_STATUS_ENDPOINT
  ).get<GetUploadStatusResponsePayload, InventoryUploadStatusDetails>(
    {
      urlReplacements: {
        '{uploadId}': uploadId.toString(),
      },
    },
    (data) => ({ uploadStatus: data })
  );

  return response;
};

/**
 * Upload an inventory file
 */
const uploadInventory = async (file: File, facilityId: string): Promise<UploadFileResponse> => {
  const params = { facilityId };
  const entity = new FormData();
  entity.append('file', file);
  const headers = {
    'content-type': 'multipart/form-data',
  };

  const serverResponse: Response = await HttpService.root(INVENTORY_UPLOADS_ENDPOINT).post({ entity, headers, params });

  const response: UploadFileResponse = {
    ...serverResponse,
    id: serverResponse?.data?.id ?? -1,
  };

  return response;
};

const searchSpeciesInventory = async ({
  organizationId,
  searchSortOrder,
  facilityIds,
  query,
}: SearchInventoryParams): Promise<SearchResponseElement[] | null> => {
  const forSpecificFacilities = (facilityIds?.length || 0) > 0;
  const params: SearchRequestPayload = {
    prefix: 'species',
    fields: forSpecificFacilities
      ? [
          'id',
          'scientificName',
          'commonName',
          'facilityInventories.activeGrowthQuantity(raw)',
          'facilityInventories.germinatingQuantity(raw)',
          'facilityInventories.hardeningOffQuantity(raw)',
          'facilityInventories.readyQuantity(raw)',
          'facilityInventories.totalQuantity(raw)',
          'facilityInventories.facility_name',
        ]
      : [
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
        ],
    sortOrder: searchSortOrder ? [searchSortOrder] : undefined,
    search: {
      operation: 'and',
      children: [
        {
          operation: 'field',
          field: 'organization_id',
          values: [organizationId],
        },
        {
          operation: 'not',
          child: {
            operation: 'field',
            field: 'batches.id', // this tells the search api to only return species that have had a non-null batch, which means that only species that have had inventory in the past will be returned
            values: [null],
          },
        },
      ],
    },
    count: 0,
  };

  const searchValueChildren: FieldNodePayload[] = [];

  if (query) {
    const { type, values } = parseSearchTerm(query);
    const scientificNameNode: FieldNodePayload = {
      operation: 'field',
      field: 'scientificName',
      type,
      values,
    };
    searchValueChildren.push(scientificNameNode);

    const commonNameNode: FieldNodePayload = {
      operation: 'field',
      field: 'commonName',
      type,
      values,
    };
    searchValueChildren.push(commonNameNode);

    const facilityNameNode: FieldNodePayload = {
      operation: 'field',
      field: 'inventory.facilityInventories.facility_name',
      type,
      values,
    };
    searchValueChildren.push(facilityNameNode);
  }

  let nurseryFilter: PrefixedSearch | undefined;

  if (facilityIds?.length) {
    nurseryFilter = {
      prefix: 'facilityInventories',
      search: {
        operation: 'field',
        field: 'facility_id',
        values: facilityIds.map((id) => id.toString()),
      },
    };
  }

  if (searchValueChildren.length) {
    const searchValueNodes: OrNodePayload = {
      operation: 'or',
      children: searchValueChildren,
    };

    params.search.children.push(searchValueNodes);
  }

  if (nurseryFilter) {
    params.filters = [nurseryFilter];
  }

  return await SearchService.search(params);
};

/**
 * Search inventory by nursery
 */
const searchInventoryByNursery = async ({
  organizationId,
  searchSortOrder,
  facilityIds,
  speciesIds,
  query,
  isCsvExport,
}: SearchInventoryParams): Promise<SearchResponseElement[] | null> => {
  const exportedFields = [
    'facility_name',
    'facilityInventories.species_scientificName',
    'germinatingQuantity',
    'hardeningOffQuantity',
    'activeGrowthQuantity',
    'readyQuantity',
    'totalQuantity',
  ];
  const nonExportedFields = [
    'facility_id',
    'facilityInventories.species_id',
    'facilityInventories.batches.id',
    'activeGrowthQuantity(raw)',
    'readyQuantity(raw)',
    'germinatingQuantity(raw)',
    'hardeningOffQuantity(raw)',
    'totalQuantity(raw)',
  ];
  const fields = isCsvExport ? exportedFields : exportedFields.concat(nonExportedFields);

  const params: SearchRequestPayload = {
    prefix: 'facilityInventoryTotals',
    fields,
    sortOrder: searchSortOrder ? [searchSortOrder] : undefined,
    search: {
      operation: 'and',
      children: [
        {
          operation: 'field',
          field: 'organization_id',
          values: [organizationId],
        },
      ],
    },
    count: 0,
  };
  const searchValueChildren: FieldNodePayload[] = [];

  if (query) {
    const { type, values } = parseSearchTerm(query);
    const scientificNameNode: FieldNodePayload = {
      operation: 'field',
      field: 'facilityInventories.species_scientificName',
      type,
      values,
    };
    searchValueChildren.push(scientificNameNode);

    const facilityNameNode: FieldNodePayload = {
      operation: 'field',
      field: 'facility_name',
      type,
      values,
    };
    searchValueChildren.push(facilityNameNode);
  }

  if (searchValueChildren.length) {
    const searchValueNodes: OrNodePayload = {
      operation: 'or',
      children: searchValueChildren,
    };

    params.search.children.push(searchValueNodes);
  }

  if (facilityIds?.length) {
    params.search.children.push({
      operation: 'field',
      field: 'facility_id',
      values: facilityIds.map((f) => f.toString()),
    } as SearchNodePayload);
  }

  if (speciesIds?.length) {
    params.search.children.push({
      operation: 'field',
      field: 'facilityInventories.species_id',
      values: speciesIds.map((s) => s.toString()),
    } as SearchNodePayload);
  }

  return isCsvExport ? await SearchService.searchCsv(params) : await SearchService.search(params);
};

/**
 * Exported functions
 */
const NurseryInventoryService = {
  getSummary,
  downloadInventoryTemplate,
  getInventoryUploadStatus,
  uploadInventory,
  searchSpeciesInventory,
  searchInventoryByNursery,
};

export default NurseryInventoryService;
