import { components } from 'src/api/types/generated-schema';

export type DocumentStatusType = components['schemas']['DocumentPayload']['status'];
export const DocumentStatuses: DocumentStatusType[] = ['Draft', 'Locked', 'Published', 'Ready', 'Submitted'];
