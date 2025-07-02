import { Theme } from '@mui/material';
import { Property } from 'csstype';

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
  'Issue Active',
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
  'Issue Active': 11,
  'Issue Reassessment': 12,
  'Not Eligible': 13,
  Accepted: 14,
  Waitlist: 15,
};

export const getApplicationStatusColor = (status: ApplicationStatus, theme: Theme): Property.Color | undefined => {
  switch (status) {
    case 'Accepted':
      return theme.palette.TwClrTxtSuccess;
    case 'Issue Active':
    case 'Issue Reassessment':
    case 'Waitlist':
      return theme.palette.TwClrTxtWarning;
    case 'Not Eligible':
      return theme.palette.TwClrTxtDanger;
    case 'Not Submitted':
    case 'Passed Pre-screen':
    case 'Submitted':
    case 'Sourcing Team Review':
    case 'GIS Assessment':
    case 'Carbon Assessment':
    case 'Expert Review':
    case 'P0 Eligible':
    case 'In Review':
      return theme.palette.TwClrTxtInfo;
    case 'Failed Pre-screen':
    default:
      return theme.palette.TwClrTxtWarning;
  }
};
