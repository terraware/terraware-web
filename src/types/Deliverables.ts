// TODO these will come from generated types
import strings from '../strings';

export type DeliverableTypeType = 'Document';
// export type DeliverableTypes = ['Document'];

export type DeliverableCategoryType = 'All' | 'Legal' | 'Financial' | 'GIS' | 'Forestry' | 'Stakeholder Engagement';
export const DeliverableCategories = ['All', 'Legal', 'Financial', 'GIS', 'Forestry', 'Stakeholder Engagement'];

export type DeliverableStatusType =
  | 'Not Submitted'
  | 'In Review'
  | 'Rejected'
  | 'Approved'
  | 'Needs Translation'
  | 'Not Needed';
export const DeliverableStatuses = [
  'Not Submitted',
  'In Review',
  'Rejected',
  'Approved',
  'Needs Translation',
  'Not Needed',
];

export type DeliverableDocument = {
  name: string;
  description: string;
  dateUploaded: string;
  link: string;
  documentType: string;
  project_name: string;
};

export type Deliverable = {
  category: DeliverableCategoryType;
  deliverableContent: string;
  documents: DeliverableDocument[];
  id: number;
  name: string;
  projectId: number;
  projectName: string;
  reason?: string;
  status: DeliverableStatusType;
  templateUrl?: string;
};

export type DeliverableData = {
  deliverable: Deliverable | null;
};

export type SearchResponseDeliverableAdmin = {
  category: DeliverableCategoryType;
  documentCount: number;
  id: number;
  name: string;
  project_name: string;
  status: DeliverableStatusType;
  type: DeliverableTypeType;
};

export type SearchResponseDeliverableParticipant = SearchResponseDeliverableAdmin & {
  description: string;
};

export type UpdateStatusRequest = {
  id: number;
  reason?: string;
  status: DeliverableStatusType;
};

export type SearchResponseDeliverable = SearchResponseDeliverableAdmin | SearchResponseDeliverableParticipant;

// TODO: update category types with BE model and return values from i18n strings dictionary
export const categoryLabel = (category: DeliverableCategoryType): string => {
  switch (category) {
    case 'Legal':
      return 'Legal';
    default:
      return category as string;
  }
};

export const statusLabel = (status: DeliverableStatusType): string => {
  switch (status) {
    case 'Not Submitted':
      return strings.NOT_SUBMITTED;
    case 'In Review':
      return strings.IN_REVIEW;
    case 'Rejected':
      return strings.REJECTED;
    case 'Approved':
      return strings.APPROVED;
    case 'Not Needed':
      return strings.NOT_NEEDED;
    case 'Needs Translation':
      return strings.NEEDS_TRANSLATION;
    default:
      return status as string;
  }
};
