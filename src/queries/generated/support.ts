import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listRequestTypes: build.query<ListRequestTypesApiResponse, ListRequestTypesApiArg>({
      query: () => ({ url: `/api/v1/support` }),
    }),
    submitRequest: build.mutation<SubmitRequestApiResponse, SubmitRequestApiArg>({
      query: (queryArg) => ({ url: `/api/v1/support`, method: 'POST', body: queryArg }),
    }),
    uploadAttachment: build.mutation<UploadAttachmentApiResponse, UploadAttachmentApiArg>({
      query: (queryArg) => ({ url: `/api/v1/support/attachment`, method: 'POST', body: queryArg }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListRequestTypesApiResponse = /** status 200 OK */ ListSupportRequestTypesResponsePayload;
export type ListRequestTypesApiArg = void;
export type SubmitRequestApiResponse = /** status 200 OK */ SubmitSupportRequestResponsePayload;
export type SubmitRequestApiArg = SubmitSupportRequestPayload;
export type UploadAttachmentApiResponse = /** status 200 OK */ UploadAttachmentResponsePayload;
export type UploadAttachmentApiArg = {
  file: Blob;
};
export type SuccessOrError = 'ok' | 'error';
export type ListSupportRequestTypesResponsePayload = {
  status: SuccessOrError;
  types: ('Bug Report' | 'Feature Request' | 'Contact Us')[];
};
export type SubmitSupportRequestResponsePayload = {
  issueKey: string;
  status: SuccessOrError;
};
export type SubmitSupportRequestPayload = {
  attachmentComment?: string;
  attachmentIds?: string[];
  description: string;
  requestType: 'Bug Report' | 'Feature Request' | 'Contact Us';
  summary: string;
};
export type TemporaryAttachment = {
  filename: string;
  temporaryAttachmentId: string;
};
export type UploadAttachmentResponsePayload = {
  attachments: TemporaryAttachment[];
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export const {
  useListRequestTypesQuery,
  useLazyListRequestTypesQuery,
  useSubmitRequestMutation,
  useUploadAttachmentMutation,
} = injectedRtkApi;
