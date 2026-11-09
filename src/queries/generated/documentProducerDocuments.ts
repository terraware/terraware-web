import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listDocuments: build.query<ListDocumentsApiResponse, ListDocumentsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/document-producer/documents`,
        params: {
          projectId: queryArg,
        },
      }),
    }),
    createDocument: build.mutation<CreateDocumentApiResponse, CreateDocumentApiArg>({
      query: (queryArg) => ({ url: `/api/v1/document-producer/documents`, method: 'POST', body: queryArg }),
    }),
    upgradeManifest: build.mutation<UpgradeManifestApiResponse, UpgradeManifestApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/document-producer/documents/${queryArg.documentId}/upgrade`,
        method: 'POST',
        body: queryArg.upgradeManifestRequestPayload,
      }),
    }),
    createSavedDocumentVersion: build.mutation<CreateSavedDocumentVersionApiResponse, CreateSavedDocumentVersionApiArg>(
      {
        query: (queryArg) => ({
          url: `/api/v1/document-producer/documents/${queryArg.documentId}/versions`,
          method: 'POST',
          body: queryArg.createSavedDocumentVersionRequestPayload,
        }),
      }
    ),
    getSavedDocumentVersion: build.query<GetSavedDocumentVersionApiResponse, GetSavedDocumentVersionApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/document-producer/documents/${queryArg.documentId}/versions/${queryArg.versionId}`,
      }),
    }),
    updateSavedDocumentVersion: build.mutation<UpdateSavedDocumentVersionApiResponse, UpdateSavedDocumentVersionApiArg>(
      {
        query: (queryArg) => ({
          url: `/api/v1/document-producer/documents/${queryArg.documentId}/versions/${queryArg.versionId}`,
          method: 'PUT',
          body: queryArg.updateSavedDocumentVersionRequestPayload,
        }),
      }
    ),
    getDocument: build.query<GetDocumentApiResponse, GetDocumentApiArg>({
      query: (queryArg) => ({ url: `/api/v1/document-producer/documents/${queryArg}` }),
    }),
    updateDocument: build.mutation<UpdateDocumentApiResponse, UpdateDocumentApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/document-producer/documents/${queryArg.id}`,
        method: 'PUT',
        body: queryArg.updateDocumentRequestPayload,
      }),
    }),
    getDocumentHistory: build.query<GetDocumentHistoryApiResponse, GetDocumentHistoryApiArg>({
      query: (queryArg) => ({ url: `/api/v1/document-producer/documents/${queryArg}/history` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListDocumentsApiResponse = /** status 200 OK */ ListDocumentsResponsePayload;
export type ListDocumentsApiArg = /** If present, only list documents for this project. */ number | undefined;
export type CreateDocumentApiResponse = /** status 200 OK */ CreateDocumentResponsePayload;
export type CreateDocumentApiArg = CreateDocumentRequestPayload;
export type UpgradeManifestApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpgradeManifestApiArg = {
  documentId: number;
  upgradeManifestRequestPayload: UpgradeManifestRequestPayload;
};
export type CreateSavedDocumentVersionApiResponse =
  /** status 200 The requested operation succeeded. */ CreateSavedDocumentVersionResponsePayload;
export type CreateSavedDocumentVersionApiArg = {
  documentId: number;
  createSavedDocumentVersionRequestPayload: CreateSavedDocumentVersionRequestPayload;
};
export type GetSavedDocumentVersionApiResponse = /** status 200 OK */ GetSavedDocumentVersionResponsePayload;
export type GetSavedDocumentVersionApiArg = {
  documentId: number;
  versionId: number;
};
export type UpdateSavedDocumentVersionApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateSavedDocumentVersionApiArg = {
  documentId: number;
  versionId: number;
  updateSavedDocumentVersionRequestPayload: UpdateSavedDocumentVersionRequestPayload;
};
export type GetDocumentApiResponse = /** status 200 OK */ GetDocumentResponsePayload;
export type GetDocumentApiArg = number;
export type UpdateDocumentApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateDocumentApiArg = {
  id: number;
  updateDocumentRequestPayload: UpdateDocumentRequestPayload;
};
export type GetDocumentHistoryApiResponse = /** status 200 OK */ GetDocumentHistoryResponsePayload;
export type GetDocumentHistoryApiArg = number;
export type DocumentPayload = {
  createdBy: number;
  createdTime: string;
  documentTemplateId: number;
  documentTemplateName: string;
  id: number;
  internalComment?: string;
  lastSavedVersionId?: number;
  modifiedBy: number;
  modifiedTime: string;
  name: string;
  ownedBy: number;
  projectDealName?: string;
  projectId: number;
  projectName: string;
  status: 'Draft' | 'Locked' | 'Published' | 'Ready' | 'Submitted';
  variableManifestId: number;
};
export type SuccessOrError = 'ok' | 'error';
export type ListDocumentsResponsePayload = {
  documents: DocumentPayload[];
  status: SuccessOrError;
};
export type CreateDocumentResponsePayload = {
  document: DocumentPayload;
  status: SuccessOrError;
};
export type CreateDocumentRequestPayload = {
  documentTemplateId: number;
  name: string;
  ownedBy: number;
  projectId: number;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type UpgradeManifestRequestPayload = {
  /** ID of manifest to upgrade the document to. This must be greater than the document's current manifest ID (downgrades are not supported) and must be for the same document template as the current manifest. */
  variableManifestId: number;
};
export type DocumentSavedVersionPayload = {
  createdBy: number;
  createdTime: string;
  isSubmitted: boolean;
  maxVariableValueId: number;
  name: string;
  variableManifestId: number;
  versionId: number;
};
export type CreateSavedDocumentVersionResponsePayload = {
  status: SuccessOrError;
  version: DocumentSavedVersionPayload;
};
export type CreateSavedDocumentVersionRequestPayload = {
  isSubmitted?: boolean;
  name: string;
};
export type GetSavedDocumentVersionResponsePayload = {
  status: SuccessOrError;
  version: DocumentSavedVersionPayload;
};
export type UpdateSavedDocumentVersionRequestPayload = {
  isSubmitted: boolean;
};
export type GetDocumentResponsePayload = {
  document: DocumentPayload;
  status: SuccessOrError;
};
export type UpdateDocumentRequestPayload = {
  internalComment?: string;
  name: string;
  ownedBy: number;
  status: 'Draft' | 'Locked' | 'Published' | 'Ready' | 'Submitted';
};
export type DocumentHistoryPayloadBase = {
  createdBy: number;
  createdTime: string;
  type: 'Created' | 'Edited' | 'Saved';
};
export type DocumentHistoryCreatedPayload = {
  type: 'Created';
} & DocumentHistoryPayloadBase;
export type DocumentHistoryEditedPayload = {
  type: 'Edited';
} & DocumentHistoryPayloadBase;
export type DocumentHistorySavedPayload = {
  type: 'Saved';
} & DocumentHistoryPayloadBase & {
    isSubmitted: boolean;
    maxVariableValueId: number;
    name: string;
    variableManifestId: number;
    versionId: number;
  };
export type GetDocumentHistoryResponsePayload = {
  /** List of events in the document's history in reverse chronological order. The last element is always the "Created" event. */
  history: (DocumentHistoryCreatedPayload | DocumentHistoryEditedPayload | DocumentHistorySavedPayload)[];
  status: SuccessOrError;
};
export const {
  useListDocumentsQuery,
  useLazyListDocumentsQuery,
  useCreateDocumentMutation,
  useUpgradeManifestMutation,
  useCreateSavedDocumentVersionMutation,
  useGetSavedDocumentVersionQuery,
  useLazyGetSavedDocumentVersionQuery,
  useUpdateSavedDocumentVersionMutation,
  useGetDocumentQuery,
  useLazyGetDocumentQuery,
  useUpdateDocumentMutation,
  useGetDocumentHistoryQuery,
  useLazyGetDocumentHistoryQuery,
} = injectedRtkApi;
