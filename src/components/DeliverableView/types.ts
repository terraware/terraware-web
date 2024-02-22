import { ReactNode } from 'react';

export type ViewProps = {
  deliverable: Deliverable;
  isAcceleratorConsole?: boolean;
};

export type EditProps = ViewProps & {
  callToAction?: ReactNode;
};

// TODO: use correct types when available.
// This is a temporary solution.
export type Deliverable = any;

export type Category =
  | 'LegalEligibility'
  | 'FinancialViability'
  | 'GIS'
  | 'CarbonEligibility'
  | 'Stakeholders'
  | 'ProposedRestorationActivities'
  | 'Media'
  | 'SupplementalFiles';

// TODO, use strings
export const categoryLabel = (category: Category): string => {
  switch (category) {
    case 'LegalEligibility':
      return 'Legal Eligibility';
    case 'FinancialViability':
      return 'Financial Viability';
    case 'GIS':
      return 'GIS';
    case 'CarbonEligibility':
      return 'Carbon Eligibility';
    case 'Stakeholders':
      return 'Stakeholders and Co-Benefits';
    case 'ProposedRestorationActivities':
      return 'Proposed Restoration Activities';
    case 'Media':
      return 'Media';
    case 'SupplementalFiles':
      return 'Supplemental Files';
    default:
      return '';
  }
};
