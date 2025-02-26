import { components } from 'src/api/types/generated-schema';

export type Application = components['schemas']['ApplicationPayload'];
export type ApplicationHistory = components['schemas']['ApplicationHistoryPayload'];
export type ApplicationStatus = Application['status'];
export type ApplicationModule = components['schemas']['ApplicationModulePayload'];
export type ApplicationDeliverable = components['schemas']['ApplicationDeliverablePayload'];
export type ApplicationReview = components['schemas']['ReviewApplicationRequestPayload'];
export type ApplicationReviewStatus = ApplicationReview['status'];

export type ApplicationDeliverableWithBoundaryFlag = ApplicationDeliverable & { isBoundary?: boolean };

export const ApplicationReviewStatuses: ApplicationReviewStatus[] = [
  'Accepted',
  'Carbon Assessment',
  'Expert Review',
  'GIS Assessment',
  'Issue Reassessment',
  'Not Eligible',
  'P0 Eligible',
  'Sourcing Team Review',
  'Submitted',
];

export const ApplicationStatusOrder: { [key in ApplicationStatus]: number } = {
  'Not Submitted': 1,
  'Failed Pre-screen': 2,
  'Passed Pre-screen': 3,
  'In Review': 4,
  Submitted: 5,
  'Sourcing Team Review': 6,
  'GIS Assessment': 7,
  'Carbon Assessment': 8,
  'Expert Review': 9,
  'P0 Eligible': 10,
  'Issue Reassessment': 11,
  'Not Eligible': 12,
  Accepted: 13,
  Waitlist: 14,
};
