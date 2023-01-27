import { OrganizationRole } from './Organization';

export type User = {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  emailNotificationsEnabled?: boolean;
  timeZone?: string;
  locale?: string;
};

export type OrganizationUser = {
  firstName?: string;
  lastName?: string;
  email: string;
  id: number;
  role: OrganizationRole;
  addedTime?: string;
};
