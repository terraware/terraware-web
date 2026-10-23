import { GetUploadStatusResponsePayload } from 'src/queries/generated/species';

export type { GetUploadStatusResponsePayload };

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
