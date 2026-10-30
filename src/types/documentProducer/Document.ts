import {
  DocumentHistoryCreatedPayload,
  DocumentHistoryEditedPayload,
  DocumentHistorySavedPayload,
  DocumentPayload,
} from 'src/queries/generated/documentProducerDocuments';

export type Document = DocumentPayload;

export type DocumentStatus = Document['status'];

export type DocumentHistoryEvent = (
  DocumentHistoryCreatedPayload | DocumentHistoryEditedPayload | DocumentHistorySavedPayload
) & {
  docId: number;
};
