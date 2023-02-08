import { components } from 'src/api/types/generated-schema';

export type GetUploadStatusResponsePayload = components['schemas']['GetUploadStatusResponsePayload'];

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
