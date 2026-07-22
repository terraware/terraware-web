import { UserProfilePayload } from 'src/queries/generated/users';

import { OrganizationRole } from './Organization';

export type User = UserProfilePayload;
export type UserGlobalRoles = User['globalRoles'];
export type UserGlobalRole = User['globalRoles'][0];

export type OrganizationUser = {
  firstName?: string;
  lastName?: string;
  email: string;
  id: number;
  role: OrganizationRole;
  addedTime?: string;
};
