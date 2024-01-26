import { OrganizationRole } from './Organization';
import { components } from 'src/api/types/generated-schema';

export type User = components['schemas']['UserProfilePayload'];
export type UserGlobalRoles = User['globalRoles'];

export type OrganizationUser = {
  firstName?: string;
  lastName?: string;
  email: string;
  id: number;
  role: OrganizationRole;
  addedTime?: string;
};

const AcceleratorAdminRoles: UserGlobalRoles = ['Super-Admin', 'Accelerator Admin'];

export const isAcceleratorAdmin = (user: User): boolean =>
  user.globalRoles.some((globalRole: UserGlobalRoles[0]) => AcceleratorAdminRoles.includes(globalRole));
