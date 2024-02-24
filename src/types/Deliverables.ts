// TODO these will come from generated types
export type DeliverableTypeType = 'Document';
// export type DeliverableTypes = ['Document'];

export type DeliverableCategoryType = 'All' | 'Legal' | 'Financial' | 'GIS' | 'Forestry' | 'Stakeholder Engagement';
// export type DeliverableCategories = ['All', 'Legal', 'Financial', 'GIS', 'Forestry', 'Stakeholder Engagement'];
export type DeliverableStatusType =
  | 'Not Submitted'
  | 'In Review'
  | 'Rejected'
  | 'Approved'
  | 'Needs Translation'
  | 'Not Needed';
// export type DeliverableStatuses = ['Not Submitted', 'In Review', 'Rejected', 'Approved'];

export type DeliverableDocument = {
  name: string;
  description: string;
  dateUploaded: string;
};

export type Deliverable = {
  id: number;
  documents: DeliverableDocument[];
  category: DeliverableCategoryType;
  reason?: string;
  status: DeliverableStatusType;
  name: string;
  projectId: number;
  projectName: string;
  deliverableContent: string;
};

export type DeliverableData = {
  deliverable: Deliverable | null;
};

export type SearchResponseDeliverableBase = {
  documentCount: number;
  id: number;
  name: string;
  project_name: string;
  status: DeliverableStatusType;
  type: DeliverableTypeType;
};

export type SearchResponseDeliverableAdmin = SearchResponseDeliverableBase & {
  category: DeliverableCategoryType;
  description: string;
};

export type UpdateStatusRequest = {
  id: number;
  reason?: string;
  status: DeliverableStatusType;
};

// TODO: update category types with BE model and return values from i18n strings dictionary
export const categoryLabel = (category: DeliverableCategoryType): string => {
  switch (category) {
    case 'Legal':
      return 'Legal';
    default:
      return category as string;
  }
};
