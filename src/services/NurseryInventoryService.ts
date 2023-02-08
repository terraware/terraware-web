import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from './HttpService';
import { SpeciesInventorySummary } from 'src/types/Inventory';
import { GetUploadStatusResponsePayload, UploadFileResponse } from 'src/types/File';

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

export type UploadInventoryFileResponse =
  paths[typeof INVENTORY_UPLOADS_ENDPOINT]['post']['responses'][200]['content']['application/json'];

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
 * Exported functions
 */
const NurseryInventoryService = {
  getSummary,
  downloadInventoryTemplate,
  getInventoryUploadStatus,
  uploadInventory,
};

export default NurseryInventoryService;
