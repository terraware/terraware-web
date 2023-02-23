import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from './HttpService';
import { SpeciesInventorySummary } from 'src/types/Inventory';
import { GetUploadStatusResponsePayload, UploadFileResponse } from 'src/types/File';
import SearchService from './SearchService';
import { FieldNodePayload, SearchNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';

/**
 * Nursery related services
 */

const SPECIES_INVENTORY_SUMMARY_ENDPOINT = '/api/v1/nursery/species/{speciesId}/summary';
const INVENTORY_TEMPLATE_ENDPOINT = '/api/v1/nursery/batches/uploads/template';
const INVENTORY_UPLOAD_STATUS_ENDPOINT = '/api/v1/nursery/batches/uploads/{uploadId}';
const INVENTORY_UPLOADS_ENDPOINT = '/api/v1/nursery/batches/uploads';

export const BE_SORTED_FIELDS = [
  'species_id',
  'species_scientificName',
  'facilityInventories.facility_name',
  'germinatingQuantity',
  'notReadyQuantity',
  'readyQuantity',
  'totalQuantity',
];

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

export type UploadInventoryFileResponse =
  paths[typeof INVENTORY_UPLOADS_ENDPOINT]['post']['responses'][200]['content']['application/json'];

export type SearchInventoryParams = {
  organizationId: number;
  searchSortOrder?: SearchSortOrder;
  query?: string;
  facilityIds?: number[];
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

/**
 * Search inventory
 */
const searchInventory = async ({
  organizationId,
  searchSortOrder,
  facilityIds,
  query,
}: SearchInventoryParams): Promise<SearchResponseElement[] | null> => {
  const params: SearchNodePayload = {
    prefix: 'inventories',
    fields: [...BE_SORTED_FIELDS, 'species_commonName', 'totalQuantity(raw)'],
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
    const scientificNameNode: FieldNodePayload = {
      operation: 'field',
      field: 'species_scientificName',
      type: 'Fuzzy',
      values: [query],
    };
    searchValueChildren.push(scientificNameNode);

    const commonNameNode: FieldNodePayload = {
      operation: 'field',
      field: 'species_commonName',
      type: 'Fuzzy',
      values: [query],
    };
    searchValueChildren.push(commonNameNode);

    const facilityNameNode: FieldNodePayload = {
      operation: 'field',
      field: 'facilityInventories.facility_name',
      type: 'Fuzzy',
      values: [query],
    };
    searchValueChildren.push(facilityNameNode);
  }

  let nurseryFilter: FieldNodePayload;

  if (facilityIds && facilityIds.length > 0) {
    nurseryFilter = {
      operation: 'field',
      field: 'facilityInventories.facility_id',
      type: 'Exact',
      values: facilityIds.map((id) => id.toString()),
    };
  }

  if (searchValueChildren.length) {
    const searchValueNodes: FieldNodePayload = {
      operation: 'or',
      children: searchValueChildren,
    };

    if (nurseryFilter) {
      params.search.children.push({
        operation: 'and',
        children: [nurseryFilter, searchValueNodes],
      });
    } else {
      params.search.children.push(searchValueNodes);
    }
  } else if (nurseryFilter) {
    params.search.children.push(nurseryFilter);
  }

  return await SearchService.search(params);
};

/**
 * Exported functions
 */
const NurseryInventoryService = {
  getSummary,
  downloadInventoryTemplate,
  getInventoryUploadStatus,
  uploadInventory,
  searchInventory,
};

export default NurseryInventoryService;
