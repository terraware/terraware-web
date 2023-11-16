import { Facility } from './Facility';
import strings from 'src/strings';
import { components } from 'src/api/types/generated-schema';

export type ManagedLocationType = 'SeedBank' | 'Nursery' | 'PlantingSite';

export const ManagedLocationTypes: ManagedLocationType[] = ['SeedBank', 'Nursery', 'PlantingSite'];

export type OrganizationType = components['schemas']['OrganizationPayload']['organizationType'];

export const OrganizationTypes: OrganizationType[] = [
  'Government',
  'NGO',
  'Arboreta',
  'Academia',
  'ForProfit',
  'Other',
];

export type Organization = {
  canSubmitReports?: boolean;
  countryCode?: string;
  countrySubdivisionCode?: string;
  createdTime?: string;
  description?: string;
  facilities?: Facility[];
  id: number;
  name: string;
  organizationType?: OrganizationType;
  organizationTypeDetails?: string;
  role: OrganizationRole;
  totalUsers: number;
  timeZone?: string;
  website?: string;
};

export type HighOrganizationRoles = 'Admin' | 'Owner' | 'Terraformation Contact';

export const HighOrganizationRolesValues = ['Admin', 'Owner', 'Terraformation Contact'];

// Manager role included here so we don't get type issues with the server response,
// which could contain a user with a manger role.
export type OrganizationRole = HighOrganizationRoles | 'Contributor' | 'Manager';

export function roleName(role: OrganizationRole) {
  switch (role) {
    case 'Admin':
      return strings.ADMIN;
    case 'Owner':
      return strings.OWNER;
    case 'Contributor':
      return strings.CONTRIBUTOR;
    case 'Manager':
      return strings.MANAGER;
    case 'Terraformation Contact':
      return strings.TERRAFORMATION_CONTACT;
  }
}

export type OrganizationRoleInfo = {
  role: OrganizationRole;
  totalUsers: number;
};

export function managedLocationTypeLabel(managedLocationType: ManagedLocationType) {
  switch (managedLocationType) {
    case 'SeedBank':
      return strings.MANAGED_LOCATION_TYPE_SEED_BANK;
    case 'Nursery':
      return strings.MANAGED_LOCATION_TYPE_NURSERY;
    case 'PlantingSite':
      return strings.MANAGED_LOCATION_TYPE_PLANTING_SITE;
  }
}

export function organizationTypeLabel(organizationType: OrganizationType) {
  switch (organizationType) {
    case 'Government':
      return strings.ORGANIZATION_TYPE_GOVERNMENT;
    case 'NGO':
      return strings.ORGANIZATION_TYPE_NGO;
    case 'Arboreta':
      return strings.ORGANIZATION_TYPE_ARBORETA;
    case 'Academia':
      return strings.ORGANIZATION_TYPE_ACADEMIA;
    case 'ForProfit':
      return strings.ORGANIZATION_TYPE_FOR_PROFIT;
    case 'Other':
      return strings.ORGANIZATION_TYPE_OTHER;
  }
}
