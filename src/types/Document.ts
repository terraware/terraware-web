import { DocumentPayload } from 'src/queries/generated/documentProducerDocuments';

export type DocumentStatusType = DocumentPayload['status'];
export const DocumentStatuses: DocumentStatusType[] = ['Draft', 'Locked', 'Published', 'Ready', 'Submitted'];
