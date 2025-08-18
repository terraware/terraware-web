import { components } from 'src/api/types/generated-schema';
import defaultStrings from 'src/strings';

export type AcceleratorOrg = components['schemas']['AcceleratorOrganizationPayload'];

export type AcceleratorOrgProject = AcceleratorOrg['projects'][0];

export type TFContactType =
  | 'Carbon Lead'
  | 'Climate Impact Lead'
  | 'Consultant'
  | 'GIS Lead'
  | 'Legal Lead'
  | 'Phase Lead'
  | 'Project Lead'
  | 'Project Finance Lead'
  | 'Regional Expert'
  | 'Restoration Lead'
  | 'Social Lead';

export const tfContactTypes: TFContactType[] = [
  'Carbon Lead',
  'Climate Impact Lead',
  'Consultant',
  'GIS Lead',
  'Legal Lead',
  'Phase Lead',
  'Project Lead',
  'Project Finance Lead',
  'Regional Expert',
  'Restoration Lead',
  'Social Lead',
];

export const getTFContactTypeString = (type: TFContactType, strings: typeof defaultStrings): string => {
  switch (type) {
    case 'Carbon Lead':
      return strings.CONTACT_TYPE_CARBON_LEAD;
    case 'Climate Impact Lead':
      return strings.CONTACT_TYPE_CLIMATE_IMPACT_LEAD;
    case 'Consultant':
      return strings.CONTACT_TYPE_CONSULTANT;
    case 'GIS Lead':
      return strings.CONTACT_TYPE_GIS_LEAD;
    case 'Legal Lead':
      return strings.CONTACT_TYPE_LEGAL_LEAD;
    case 'Phase Lead':
      return strings.CONTACT_TYPE_PHASE_LEAD;
    case 'Project Lead':
      return strings.CONTACT_TYPE_PROJECT_LEAD;
    case 'Project Finance Lead':
      return strings.CONTACT_TYPE_PROJECT_FINANCE_LEAD;
    case 'Regional Expert':
      return strings.CONTACT_TYPE_REGIONAL_EXPERT;
    case 'Restoration Lead':
      return strings.CONTACT_TYPE_RESTORATION_LEAD;
    case 'Social Lead':
      return strings.CONTACT_TYPE_SOCIAL_LEAD;
    default:
      return '';
  }
};
