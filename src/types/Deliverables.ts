import { components } from 'src/api/types/generated-schema';
import strings from 'src/strings';

export type Deliverable = components['schemas']['DeliverablePayload'];
export type DeliverableTypeType = components['schemas']['DeliverablePayload']['type'];

export type DeliverableCategoryType = components['schemas']['DeliverablePayload']['category'];
export const DeliverableCategories: DeliverableCategoryType[] = [
  'Carbon Eligibility',
  'Compliance',
  'Financial Viability',
  'GIS',
  'Proposed Restoration Activities',
  'Stakeholders and Community Impact',
  'Supplemental Files',
  'Verra Non-Permanence Risk Tool (NPRT)',
];

export type DeliverableStatusType = components['schemas']['DeliverablePayload']['status'];
export const DeliverableStatuses: DeliverableStatusType[] = [
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
    case 'Verra Non-Permanence Risk Tool (NPRT)':
      return strings.VERRA_NPRT;
    case 'Financial Viability':
      return strings.FINANCIAL_VIABILITY;
    case 'GIS':
      return strings.GIS;
    case 'Carbon Eligibility':
      return strings.CARBON_ELIGIBILITY;
    case 'Stakeholders and Community Impact':
      return strings.STAKEHOLDERS_AND_COMMUNITY_IMPACT;
    case 'Proposed Restoration Activities':
      return strings.PROPOSED_RESTORATION_ACTIVITIES;
    case 'Compliance':
      return strings.COMPLIANCE;
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
