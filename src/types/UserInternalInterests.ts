import { GetUserInternalInterestsResponsePayload } from 'src/queries/generated/userInternalInterests';
import strings from 'src/strings';

export type InternalInterest = GetUserInternalInterestsResponsePayload['internalInterests'][number];

export const InternalInterests: InternalInterest[] = [
  'Compliance',
  'Financial Viability',
  'GIS',
  'Carbon Eligibility',
  'Stakeholders and Community Impact',
  'Proposed Restoration Activities',
  'Verra Non-Permanence Risk Tool (NPRT)',
  'Supplemental Files',
  'Sourcing',
];

export const internalInterestLabel = (category: InternalInterest): string => {
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
    case 'Sourcing':
      return strings.SOURCING;

    default:
      return category as string;
  }
};
