import { components } from 'src/api/types/generated-schema';
import strings from 'src/strings';

import { UserGlobalRole } from './User';

export type UserWithGlobalRoles = components['schemas']['UserWithGlobalRolesPayload'];

export const GLOBAL_ROLE_ACCELERATOR_ADMIN: UserGlobalRole = 'Accelerator Admin';
export const GLOBAL_ROLE_READ_ONLY: UserGlobalRole = 'Read Only';
export const GLOBAL_ROLE_SUPER_ADMIN: UserGlobalRole = 'Super-Admin';
export const GLOBAL_ROLE_TF_EXPERT: UserGlobalRole = 'TF Expert';

// These are intentionally ordered from "highest permission" to "lowest permission"
export const USER_GLOBAL_ROLES: UserGlobalRole[] = [
  GLOBAL_ROLE_SUPER_ADMIN,
  GLOBAL_ROLE_ACCELERATOR_ADMIN,
  GLOBAL_ROLE_TF_EXPERT,
  GLOBAL_ROLE_READ_ONLY,
];

export const isUserGlobalRole = (input: unknown): input is UserGlobalRole =>
  USER_GLOBAL_ROLES.includes(input as UserGlobalRole);

export const getHighestGlobalRole = (globalRoles?: UserGlobalRole[]): string => {
  for (const globalRole of USER_GLOBAL_ROLES) {
    if ((globalRoles || []).includes(globalRole)) {
      return globalRole;
    }
  }
  return '';
};

export type GlobalRolesUsersData = {
  users: UserWithGlobalRoles[];
};

export const getGlobalRole = (globalRole: UserGlobalRole): string => {
  switch (globalRole) {
    case 'Accelerator Admin': {
      return strings.GLOBAL_ROLE_ACCELERATOR_ADMIN;
    }
    case 'Read Only': {
      return strings.GLOBAL_ROLE_READ_ONLY;
    }
    case 'Super-Admin': {
      return strings.GLOBAL_ROLE_SUPER_ADMIN;
    }
    case 'TF Expert': {
      return strings.GLOBAL_ROLE_TF_EXPERT;
    }

    default: {
      return `${globalRole}`;
    }
  }
};
