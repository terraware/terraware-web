import axios from 'axios';
import { GetUploadStatusResponsePayload, ResolveResponse, UploadFileResponse } from '../types/uploadFile';
import { paths } from '../types/generated-schema';
import { addError } from './utils';

const ACCESSIONS2_ROOT_ENDPOINT = '/api/v2/seedbank/accessions';
const ACCESSIONS2_ENDPOINT = '/api/v2/seedbank/accessions/{id}';
const HISTORY_ENDPOINT = '/api/v1/seedbank/accessions/{id}/history';

type ListAutomationsResponsePayload =
  paths[typeof ACCESSIONS2_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type Accession2 = ListAutomationsResponsePayload['accession'];

export type Withdrawal2 = Required<Accession2>['withdrawals'][0];

export const getAccession2 = async (accessionId: number): Promise<Accession2> => {
  const endpoint = ACCESSIONS2_ENDPOINT.replace('{id}', `${accessionId}`);
  const response: ListAutomationsResponsePayload = (await axios.get(endpoint)).data;

  return response.accession;
};

type UpdateAcccessionResponse = {
  requestSucceeded: boolean;
  accession: Accession2 | undefined;
  error?: string;
};

type UpdateAccessionResponsePayloadV2 =
  paths[typeof ACCESSIONS2_ENDPOINT]['put']['responses'][200]['content']['application/json'];

type updateAccessionQuery = paths[typeof ACCESSIONS2_ENDPOINT]['put']['parameters']['query'];

export const updateAccession2 = async (
  accession: Accession2,
  simulate?: boolean
): Promise<UpdateAcccessionResponse> => {
  const queryParams: updateAccessionQuery = {
    simulate: simulate !== undefined ? simulate.toString() : 'false',
  };

  const response: UpdateAcccessionResponse = {
    requestSucceeded: true,
    accession: undefined,
  };
  const endpoint = ACCESSIONS2_ENDPOINT.replace('{id}', `${accession.id}`);
  try {
    const serverResponse: UpdateAccessionResponsePayloadV2 = (
      await axios.put(endpoint, accession, { params: queryParams })
    ).data;
    response.accession = serverResponse.accession;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
      addError(serverResponse, response);
    }
  } catch (e: any) {
    response.requestSucceeded = false;
    addError(e?.response?.data || {}, response);
  }

  return response;
};

type AccessionPostResponse =
  paths[typeof ACCESSIONS2_ROOT_ENDPOINT]['post']['responses'][200]['content']['application/json'];

export type AccessionPostRequestBody =
  paths[typeof ACCESSIONS2_ROOT_ENDPOINT]['post']['requestBody']['content']['application/json'];

type CreateAccessionResponse = {
  requestSucceeded: boolean;
  id: number;
  error?: string;
};

export const postAccession = async (accession: AccessionPostRequestBody): Promise<CreateAccessionResponse> => {
  const response: CreateAccessionResponse = {
    requestSucceeded: true,
    id: 0,
  };

  try {
    const serverResponse: AccessionPostResponse = (await axios.post(ACCESSIONS2_ROOT_ENDPOINT, accession)).data;
    response.id = serverResponse.accession.id;
  } catch (e: any) {
    response.requestSucceeded = false;
    addError(e?.response?.data || {}, response);
  }

  return response;
};

/**
 * Accessions history
 */
type GetAccessionHistoryResponsePayload =
  paths[typeof HISTORY_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type AccessionHistory = GetAccessionHistoryResponsePayload['history'];

export type AccessionHistoryEntry = Required<AccessionHistory>[0];

type ListAccessionHistoryResponse = {
  requestSucceeded: boolean;
  history?: AccessionHistoryEntry[];
};

export const getAccessionHistory = async (accessionId: number): Promise<ListAccessionHistoryResponse> => {
  const endpoint = HISTORY_ENDPOINT.replace('{id}', `${accessionId}`);
  const response: ListAccessionHistoryResponse = {
    requestSucceeded: true,
  };

  try {
    const serverResponse: GetAccessionHistoryResponsePayload = (await axios.get(endpoint)).data;
    response.history = serverResponse.history;
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};

const DOWNLOAD_ACCESSIONS_TEMPLATE = '/api/v2/seedbank/accessions/uploads/template';
export async function downloadAccessionsTemplate() {
  const response = (await axios.get(DOWNLOAD_ACCESSIONS_TEMPLATE)).data;
  return response;
}

const UPLOAD_ACCESSIONS_FILE = '/api/v2/seedbank/accessions/uploads';
type UploadAccessionsFileResponse =
  paths[typeof UPLOAD_ACCESSIONS_FILE]['post']['responses'][200]['content']['application/json'];
export async function uploadAccessionsFile(file: File, facilityId: string) {
  const response: UploadFileResponse = {
    id: -1,
    requestSucceeded: true,
  };
  const formData = new FormData();
  formData.append('facilityId', facilityId);
  formData.append('file', file);
  const config = {
    headers: {
      'content-type': 'multipart/form-data',
    },
  };
  try {
    const serverResponse: UploadAccessionsFileResponse = (await axios.post(UPLOAD_ACCESSIONS_FILE, formData, config))
      .data;
    response.id = serverResponse.id;
  } catch (error) {
    response.requestSucceeded = false;
  }
  return response;
}

const UPLOAD_ACCESSIONS_STATUS = '/api/v2/seedbank/accessions/uploads/{uploadId}';
export async function getAccessionsUploadStatus(uploadId: number): Promise<GetUploadStatusResponsePayload> {
  const serverResponse: GetUploadStatusResponsePayload = (
    await axios.get(UPLOAD_ACCESSIONS_STATUS.replace('{uploadId}', uploadId.toString()))
  ).data;
  return serverResponse;
}

const RESOLVE_ACCESSIONS_UPLOAD = '/api/v2/seedbank/accessions/uploads/{uploadId}/resolve';
export async function resolveAccessionsUpload(uploadId: number, overwriteExisting: boolean) {
  const response: ResolveResponse = {
    requestSucceeded: true,
  };
  try {
    await axios.post(RESOLVE_ACCESSIONS_UPLOAD.replace('{uploadId}', uploadId.toString()), { overwriteExisting });
  } catch {
    response.requestSucceeded = false;
  }
  return response;
}
