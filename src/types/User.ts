import { components } from 'src/api/types/generated-schema';

import { OrganizationRole } from './Organization';

export type User = components['schemas']['UserProfilePayload'];
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
