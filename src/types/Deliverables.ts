import { DateTime } from 'luxon';

import {
  DeliverablePayload,
  ListDeliverablesElement,
  ListDeliverablesResponsePayload,
} from 'src/queries/generated/deliverables';
import strings from 'src/strings';
import { today } from 'src/utils/dateUtils';

export type Deliverable = DeliverablePayload;
export type DeliverableTypeType = Deliverable['type'];
export const DeliverableTypes: DeliverableTypeType[] = ['Document', 'Species', 'Questions'];

export type DeliverableCategoryType = Deliverable['category'];
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

export type DeliverableStatusType = Deliverable['status'];

export const DeliverableStatusOrder: { [key in DeliverableStatusTypeWithOverdue]: number } = {
  Overdue: 0,
  Rejected: 1,
  'Not Submitted': 2,
  'In Review': 3,
  'Needs Translation': 3,
  Approved: 4,
  'Not Needed': 5,
  Completed: 5,
};

export type DeliverableStatusTypeWithOverdue = DeliverableStatusType | 'Overdue';
export const DeliverableStatusesWithOverdue: DeliverableStatusTypeWithOverdue[] = [
  'Not Submitted',
  'In Review',
  'Rejected',
  'Approved',
  'Needs Translation',
  'Not Needed',
  'Overdue',
];

export type UploadDeliverableDocumentRequest = {
  description: string;
  file: File;
  projectId: number;
};

export type { ListDeliverablesElement, ListDeliverablesResponsePayload };

export type DeliverableWithOverdue = Omit<Deliverable, 'status'> & {
  status: DeliverableStatusTypeWithOverdue;
};

export type ListDeliverablesElementWithOverdue = Omit<ListDeliverablesElement, 'status'> & {
  status: DeliverableStatusTypeWithOverdue;
};

export type ListDeliverablesElementWithOverdueAndDueDate = Omit<ListDeliverablesElementWithOverdue, 'dueDate'> & {
  dueDate: string;
};

export const withOverdueStatus = <T extends { dueDate?: string; status: DeliverableStatusType }>(
  deliverable: T
): Omit<T, 'status'> & { status: DeliverableStatusTypeWithOverdue } =>
  deliverable.dueDate && DateTime.fromISO(deliverable.dueDate) < today && deliverable.status === 'Not Submitted'
    ? { ...deliverable, status: 'Overdue' }
    : deliverable;

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
