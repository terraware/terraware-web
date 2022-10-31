import axios from 'axios';
import { addError } from '../accessions2/utils';
import { paths } from '../types/generated-schema';
import { SpeciesInventorySummary } from '../types/inventory';
import { GetUploadStatusResponsePayload, UploadFileResponse } from '../types/uploadFile';

const SPECIES_INVENTORY_SUMMARY_ENDPOINT = '/api/v1/nursery/species/{speciesId}/summary';

type GetSummaryResponsePayload =
  paths[typeof SPECIES_INVENTORY_SUMMARY_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type GetSummaryResponse = {
  summary: SpeciesInventorySummary | null;
  requestSucceeded: boolean;
  error?: string;
};

export const getSummary = async (speciesId: number | string): Promise<GetSummaryResponse> => {
  const response: GetSummaryResponse = {
    summary: null,
    requestSucceeded: true,
  };
  const endpoint = SPECIES_INVENTORY_SUMMARY_ENDPOINT.replace('{speciesId}', `${speciesId}`);

  try {
    const serverResponse: GetSummaryResponsePayload = (await axios.get(endpoint)).data;

    if (serverResponse.status === 'ok') {
      response.summary = serverResponse.summary;
    } else {
      response.requestSucceeded = false;
    }
  } catch (e: any) {
    addError(e?.response?.data || {}, response);
    response.requestSucceeded = false;
  }

  return response;
};

const DOWNLOAD_INVENTORY_TEMPLATE = '/api/v1/nursery/batches/uploads/template';
export async function downloadInventoryTemplate() {
  const response = (await axios.get(DOWNLOAD_INVENTORY_TEMPLATE)).data;
  return response;
}

const UPLOAD_STATUS = '/api/v1/nursery/batches/uploads/{uploadId}';
export async function getInventoryUploadStatus(uploadId: number): Promise<GetUploadStatusResponsePayload> {
  const serverResponse: GetUploadStatusResponsePayload = (
    await axios.get(UPLOAD_STATUS.replace('{uploadId}', uploadId.toString()))
  ).data;
  return serverResponse;
}

const UPLOAD_INVENTORY_FILE = '/api/v1/nursery/batches/uploads';
type uploadInventoryFileQuery = paths[typeof UPLOAD_INVENTORY_FILE]['post']['parameters']['query'];
export type UploadInventoryFileResponse =
  paths[typeof UPLOAD_INVENTORY_FILE]['post']['responses'][200]['content']['application/json'];

export async function uploadInventoryFile(file: File, facilityId: string) {
  const queryParams: uploadInventoryFileQuery = {
    facilityId: +facilityId,
  };
  const response: UploadFileResponse = {
    id: -1,
    requestSucceeded: true,
  };
  const formData = new FormData();
  formData.append('file', file);
  const config = {
    headers: {
      'content-type': 'multipart/form-data',
    },
    params: queryParams,
  };
  try {
    const serverResponse: UploadInventoryFileResponse = (await axios.post(UPLOAD_INVENTORY_FILE, formData, config))
      .data;
    response.id = serverResponse.id;
  } catch (error) {
    response.requestSucceeded = false;
  }
  return response;
}
