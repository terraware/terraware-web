import { components } from './generated-schema';

export type Document = components['schemas']['PddPayload'];

export type DocumentGetResponse = components['schemas']['GetPddResponsePayload'];

export type DocumentListResponse = components['schemas']['ListPddsResponsePayload'];

export type CreateDocumentPayload = components['schemas']['CreatePddRequestPayload'];
export type CreateDocumentResponse = components['schemas']['CreatePddResponsePayload'];

export type UpdateDocumentPayload = components['schemas']['UpdatePddRequestPayload'];
export type UpdateDocumentResponse = components['schemas']['SimpleSuccessResponsePayload'];

export type UpgradeManifestPayload = components['schemas']['UpgradeManifestRequestPayload'];
export type UpgradeManifestResponse = components['schemas']['SimpleSuccessResponsePayload'];

export type DocumentStatus = Document['status'];

export type DocumentHistoryGetResponse = components['schemas']['GetDocumentHistoryResponsePayload'];

export type DocumentHistoryCreatedPayload = components['schemas']['PddHistoryCreatedPayload'];
export type DocumentHistoryEditedPayload = components['schemas']['PddHistoryEditedPayload'];
export type DocumentHistorySavedPayload = components['schemas']['PddHistorySavedPayload'];

export type DocumentHistoryEvent = (
  | DocumentHistoryCreatedPayload
  | DocumentHistoryEditedPayload
  | DocumentHistorySavedPayload
) & {
  docId: number;
};

export type CreateSavedDocVersionPayload = components['schemas']['CreateSavedPddVersionRequestPayload'];
export type CreateSavedDocVersionResponsePayload = components['schemas']['CreateSavedPddVersionResponsePayload'];

export type UpdateSavedDocVersionPayload = components['schemas']['UpdateSavedPddVersionRequestPayload'];
