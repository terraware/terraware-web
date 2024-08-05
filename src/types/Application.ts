import { components } from 'src/api/types/generated-schema';

export type Application = components['schemas']['ApplicationPayload'];
export type ApplicationHistory = components['schemas']['ApplicationHistoryPayload'];
export type ApplicationStatus = Application['status'];
export type ApplicationModule = components['schemas']['ApplicationModulePayload'];
export type ApplicationDeliverable = components['schemas']['ApplicationDeliverablePayload'];
export type ApplicationReview = components['schemas']['ReviewApplicationRequestPayload'];
export type ApplicationReviewStatus = ApplicationReview['status'];

export const ApplicaitonReviewStatuses: ApplicationReviewStatus[] = [
  'Accepted',
  'Carbon Eligible',
  'Issue Active',
  'Issue Pending',
  'Issue Resolved',
  'Needs Follow-up',
  'Not Accepted',
  'Not Submitted',
  'PL Review',
  'Pre-check',
  'Ready for Review',
  'Submitted',
  'Passed Pre-screen',
  'Failed Pre-screen',
];
