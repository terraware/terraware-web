import { components } from 'src/api/types/generated-schema';

export type UserWithGlobalRoles = components['schemas']['UserWithGlobalRolesPayload'];

export type GlobalRole = UserWithGlobalRoles['globalRoles'][0];
export const GlobalRoles: GlobalRole[] = ['Super-Admin', 'Accelerator Admin', 'TF Expert', 'Read Only'];

export type GlobalRolesUsersData = {
  users: UserWithGlobalRoles[];
};
