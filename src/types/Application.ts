import { components } from 'src/api/types/generated-schema';

export type Application = components['schemas']['ApplicationPayload'];
export type ApplicationHistory = components['schemas']['ApplicationHistoryPayload'];
export type ApplicationStatus = Application['status'];
export type ApplicationModule = components['schemas']['ApplicationModulePayload'];
export type ApplicationDeliverable = components['schemas']['ApplicationDeliverablePayload'];
export type ApplicationReview = components['schemas']['ReviewApplicationRequestPayload'];
export type ApplicationReviewStatus = ApplicationReview['status'];

export const ApplicationReviewStatuses: ApplicationReviewStatus[] = [
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
];

export const ApplicationStatusOrder: { [key in ApplicationStatus]: number } = {
  'Not Submitted': 1,
  'Failed Pre-screen': 2,
  'Passed Pre-screen': 3,
  'In Review': 4,
  Submitted: 5,
  'PL Review': 6,
  'Ready for Review': 7,
  'Pre-check': 8,
  'Needs Follow-up': 9,
  'Carbon Eligible': 10,
  Accepted: 11,
  Waitlist: 12,
  'Issue Active': 13,
  'Issue Pending': 14,
  'Issue Resolved': 15,
  'Not Accepted': 16,
};

export const getApplicationStatusLabel = (status: ApplicationStatus): string => {
  switch (status) {
    case 'Issue Active':
    case 'Issue Pending':
    case 'Issue Resolved':
      return `Waitlist - ${status}`;
    default:
      return status;
  }
};
