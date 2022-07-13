import { Facility } from 'src/api/types/facilities';

export type ServerOrganization = {
  id: number;
  name: string;
  role: AllOrganizationRoles;
  facilities?: Facility[];
  countryCode?: string;
  countrySubdivisionCode?: string;
  description?: string;
  createdTime?: string;
  totalUsers: number;
};

export type HighOrganizationRoles = 'Admin' | 'Owner';

export const HighOrganizationRolesValues = ['Admin', 'Owner'];

// Manager role included here so we don't get type issues with the server response,
// which could contain a user with a manger role.
export type AllOrganizationRoles = HighOrganizationRoles | 'Contributor' | 'Manager';

export interface SelectedOrgInfo {
  selectedFacility?: Facility;
}
