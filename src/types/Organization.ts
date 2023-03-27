import { Facility } from './Facility';
import strings from 'src/strings';

export type Organization = {
  id: number;
  name: string;
  role: OrganizationRole;
  facilities?: Facility[];
  countryCode?: string;
  countrySubdivisionCode?: string;
  description?: string;
  createdTime?: string;
  totalUsers: number;
  timeZone?: string;
  canSubmitReports?: boolean;
};

export type HighOrganizationRoles = 'Admin' | 'Owner';

export const HighOrganizationRolesValues = ['Admin', 'Owner'];

// Manager role included here so we don't get type issues with the server response,
// which could contain a user with a manger role.
export type OrganizationRole = HighOrganizationRoles | 'Contributor' | 'Manager';

export interface SelectedOrgInfo {
  selectedFacility?: Facility;
}

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
  }
}

export type OrganizationRoleInfo = {
  role: OrganizationRole;
  totalUsers: number;
};
