import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listDocumentTemplates: build.query<ListDocumentTemplatesApiResponse, ListDocumentTemplatesApiArg>({
      query: () => ({ url: `/api/v1/document-producer/templates` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListDocumentTemplatesApiResponse = /** status 200 OK */ ListDocumentTemplatesResponsePayload;
export type ListDocumentTemplatesApiArg = void;
export type DocumentTemplatePayload = {
  id: number;
  name: string;
  /** ID of the most recent variable manifest for the document template, if any. */
  variableManifestId?: number;
};
export type SuccessOrError = 'ok' | 'error';
export type ListDocumentTemplatesResponsePayload = {
  documentTemplates: DocumentTemplatePayload[];
  status: SuccessOrError;
};
export const { useListDocumentTemplatesQuery, useLazyListDocumentTemplatesQuery } = injectedRtkApi;
