import { AllOrganizationRoles } from './Organization';

export type User = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

export type OrganizationUser = {
  firstName?: string;
  lastName?: string;
  email: string;
  id: number;
  role: AllOrganizationRoles;
  projectIds: number[];
  addedTime?: string;
};
