import { OrganizationUserPayload } from 'src/queries/generated/organizationUsers';
import { UserProfilePayload } from 'src/queries/generated/users';

export type User = UserProfilePayload;
export type UserGlobalRoles = User['globalRoles'];
export type UserGlobalRole = User['globalRoles'][0];

export type OrganizationUser = OrganizationUserPayload;
