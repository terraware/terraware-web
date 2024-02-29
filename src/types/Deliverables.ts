import strings from 'src/strings';
import { components } from 'src/api/types/generated-schema';

export type Deliverable = components['schemas']['DeliverablePayload'];
export type DeliverableTypeType = components['schemas']['DeliverablePayload']['type'];

export type DeliverableCategoryType = components['schemas']['DeliverablePayload']['category'];
export const DeliverableCategories = [
  'Legal Eligibility',
  'Financial Viability',
  'GIS',
  'Carbon Eligibility',
  'Stakeholders and Co-Benefits',
  'Proposed Restoration Activities',
  'Media',
  'Supplemental Files',
];

export type DeliverableStatusType = components['schemas']['DeliverablePayload']['status'];
export const DeliverableStatuses = [
  'Not Submitted',
  'In Review',
  'Rejected',
  'Approved',
  'Needs Translation',
  'Not Needed',
];

export type DeliverableDocument = components['schemas']['SubmissionDocumentPayload'];

export type DeliverableData = {
  deliverable: Deliverable | undefined;
};

export type ListDeliverablesResponsePayload = components['schemas']['ListDeliverablesResponsePayload'];
export type ListDeliverablesElement = components['schemas']['ListDeliverablesElement'];

export type DeliverablesData = {
  deliverables: ListDeliverablesElement[];
};

export const categoryLabel = (category: DeliverableCategoryType): string => {
  switch (category) {
    case 'Legal Eligibility':
      return strings.LEGAL_ELIGIBILITY;
    case 'Financial Viability':
      return strings.FINANCIAL_VIABILITY;
    case 'GIS':
      return strings.GIS;
    case 'Carbon Eligibility':
      return strings.CARBON_ELIGIBILITY;
    case 'Stakeholders and Co-Benefits':
      return strings.STAKEHOLDERS_AND_COBENEFITS;
    case 'Proposed Restoration Activities':
      return strings.PROPOSED_RESTORATION_ACTIVITIES;
    case 'Media':
      return strings.MEDIA;
    case 'Supplemental Files':
      return strings.SUPPLEMENTAL_FILES;

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
