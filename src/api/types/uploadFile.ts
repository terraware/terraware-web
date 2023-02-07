import { paths } from './generated-schema';
const UPLOAD_STATUS = '/api/v1/species/uploads/{uploadId}';

export type GetUploadStatusResponsePayload =
  paths[typeof UPLOAD_STATUS]['get']['responses'][200]['content']['application/json'];

export type UploadResponse = {
  uploadStatus?: GetUploadStatusResponsePayload;
  requestSucceeded: boolean;
};

export type UploadFileResponse = {
  id: number;
  requestSucceeded: boolean;
};

export type ResolveResponse = {
  requestSucceeded: boolean;
};
