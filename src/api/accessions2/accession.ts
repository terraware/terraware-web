import axios from 'axios';
import { GetUploadStatusResponsePayload, ResolveResponse, UploadFileResponse } from '../types/uploadFile';
import { paths } from '../types/generated-schema';

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
