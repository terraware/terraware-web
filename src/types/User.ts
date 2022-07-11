import { AllOrganizationRoles } from './Organization';

export type User = {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  emailNotificationsEnabled?: boolean;
};

export type OrganizationUser = {
  firstName?: string;
  lastName?: string;
  email: string;
  id: number;
  role: AllOrganizationRoles;
  addedTime?: string;
};
