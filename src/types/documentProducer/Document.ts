import { components } from 'src/api/types/generated-schema';

export type Document = components['schemas']['DocumentPayload'];

export type DocumentGetResponse = components['schemas']['GetDocumentResponsePayload'];

export type DocumentListResponse = components['schemas']['ListDocumentsResponsePayload'];

export type CreateDocumentPayload = components['schemas']['CreateDocumentRequestPayload'];
export type CreateDocumentResponse = components['schemas']['CreateDocumentResponsePayload'];

export type UpdateDocumentPayload = components['schemas']['UpdateDocumentRequestPayload'];
export type UpdateDocumentResponse = components['schemas']['SimpleSuccessResponsePayload'];

export type UpgradeManifestPayload = components['schemas']['UpgradeManifestRequestPayload'];
export type UpgradeManifestResponse = components['schemas']['SimpleSuccessResponsePayload'];

export type DocumentStatus = Document['status'];

export type DocumentHistoryGetResponse = components['schemas']['GetDocumentHistoryResponsePayload'];

export type DocumentHistoryCreatedPayload = components['schemas']['DocumentHistoryCreatedPayload'];
export type DocumentHistoryEditedPayload = components['schemas']['DocumentHistoryEditedPayload'];
export type DocumentHistorySavedPayload = components['schemas']['DocumentHistorySavedPayload'];

export type DocumentHistoryEvent = (
  | DocumentHistoryCreatedPayload
  | DocumentHistoryEditedPayload
  | DocumentHistorySavedPayload
) & {
  docId: number;
};

export type CreateSavedDocVersionPayload = components['schemas']['CreateSavedDocumentVersionRequestPayload'];
export type CreateSavedDocVersionResponsePayload = components['schemas']['CreateSavedDocumentVersionResponsePayload'];

export type UpdateSavedDocVersionPayload = components['schemas']['UpdateSavedDocumentVersionRequestPayload'];
