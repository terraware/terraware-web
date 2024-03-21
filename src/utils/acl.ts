import {
  GLOBAL_ROLE_ACCELERATOR_ADMIN,
  GLOBAL_ROLE_READ_ONLY,
  GLOBAL_ROLE_SUPER_ADMIN,
  GLOBAL_ROLE_TF_EXPERT,
  USER_GLOBAL_ROLES,
  isUserGlobalRole,
} from 'src/types/GlobalRoles';
import { Organization } from 'src/types/Organization';
import { User, UserGlobalRole, UserGlobalRoles } from 'src/types/User';
import { isArrayOfT } from 'src/types/utils';

import { isManagerOrHigher, isMember } from './organization';

// Acceptable permission are:
// - view (page)
// - create (entity)
// - read (entity)
// - update (entity)
// - delete (entity)
// - assign (entity->entity)
//
// Assign is (under the hood) an update, but we want to call it out specifically because there are some
// roles that can assign to an entity but technically can't update it (assign global role is a good example)

type PermissionCohort = 'CREATE_COHORTS' | 'READ_COHORTS' | 'UPDATE_COHORTS' | 'DELETE_COHORTS';
type PermissionConsole = 'VIEW_CONSOLE';
type PermissionDeliverable =
  | 'CREATE_SUBMISSION'
  | 'READ_DELIVERABLE'
  | 'READ_SUBMISSION_DOCUMENT'
  | 'UPDATE_SUBMISSION_STATUS';
type PermissionGlobalRole = 'READ_GLOBAL_ROLES' | 'ASSIGN_GLOBAL_ROLE_TO_USER' | 'ASSIGN_SOME_GLOBAL_ROLES';
type PermissionParticipant =
  | 'CREATE_PARTICIPANTS'
  | 'READ_PARTICIPANTS'
  | 'UPDATE_PARTICIPANTS'
  | 'DELETE_PARTICIPANTS'
  | 'EXPORT_PARTICIPANTS'
  | 'ASSIGN_PARTICIPANT_TO_COHORT';
// This name might change, the entity doesn't exist yet. May end up adding extra properties to
// the "project"" entity or creating a new "project accelerator data" entity
type PermissionProjectAcceleratorData =
  | 'READ_PROJECT_ACCELERATOR_DATA'
  | 'UPDATE_PARTICIPANT_PROJECT'
  | 'ASSIGN_PROJECT_TO_PARTICIPANT';

export type GlobalRolePermission =
  | PermissionCohort
  | PermissionConsole
  | PermissionDeliverable
  | PermissionGlobalRole
  | PermissionParticipant
  | PermissionProjectAcceleratorData;

type PermissionCheckFn<T = any> = (user: User, permission: GlobalRolePermission, metadata?: T) => boolean;

const SuperAdminPlus: UserGlobalRoles = [GLOBAL_ROLE_SUPER_ADMIN];
const AcceleratorAdminPlus: UserGlobalRoles = [...SuperAdminPlus, GLOBAL_ROLE_ACCELERATOR_ADMIN];
const TFExpertPlus: UserGlobalRoles = [...AcceleratorAdminPlus, GLOBAL_ROLE_TF_EXPERT];
const ReadOnlyPlus: UserGlobalRoles = [...TFExpertPlus, GLOBAL_ROLE_READ_ONLY];

const isSuperAdmin = (user: User): boolean => user.globalRoles.includes(GLOBAL_ROLE_SUPER_ADMIN);
const isAcceleratorAdmin = (user: User): boolean =>
  isSuperAdmin(user) || user.globalRoles.includes(GLOBAL_ROLE_ACCELERATOR_ADMIN);
const isReadOnlyOrHigher = (user: User): boolean => ReadOnlyPlus.some((role) => user.globalRoles.includes(role));

// This one is a bit more complicated because the permission is dependent on the role
export const globalRolesAvailableToSet = (user: User): UserGlobalRole[] => {
  if (isSuperAdmin(user)) {
    // Super admin can assign all roles
    return USER_GLOBAL_ROLES;
  } else if (isAcceleratorAdmin(user)) {
    // Accelerator admin can assign all but super admin
    return [GLOBAL_ROLE_ACCELERATOR_ADMIN, GLOBAL_ROLE_TF_EXPERT, GLOBAL_ROLE_READ_ONLY];
  } else {
    return [];
  }
};

type AssignGlobalRoleToUserMetadata = { roleToSet: UserGlobalRole };
const isAllowedAssignGlobalRoleToUser: PermissionCheckFn<AssignGlobalRoleToUserMetadata> = (
  user: User,
  _: GlobalRolePermission,
  metadata?: AssignGlobalRoleToUserMetadata
): boolean => {
  if (!metadata) {
    return false;
  }
  return globalRolesAvailableToSet(user).includes(metadata.roleToSet);
};

const isAllowedAssignSomeGlobalRoles: PermissionCheckFn = (user: User): boolean =>
  globalRolesAvailableToSet(user).length > 0;

type CreateSubmissionMetadata = { organization: Organization };
const isAllowedCreateSubmission: PermissionCheckFn<CreateSubmissionMetadata> = (
  user: User,
  _: GlobalRolePermission,
  metadata?: CreateSubmissionMetadata
): boolean => {
  return isAcceleratorAdmin(user) || isManagerOrHigher(metadata?.organization);
};

type ReadSubmissionMetadata = { organization: Organization };
const isAllowedReadDeliverable: PermissionCheckFn<ReadSubmissionMetadata> = (
  user: User,
  _: GlobalRolePermission,
  metadata?: ReadSubmissionMetadata
): boolean => {
  return isReadOnlyOrHigher(user) || isMember(metadata?.organization);
};

// List of permissions and roles that have those permissions
const ACL: Record<GlobalRolePermission, UserGlobalRoles | PermissionCheckFn> = {
  VIEW_CONSOLE: ReadOnlyPlus,
  READ_GLOBAL_ROLES: AcceleratorAdminPlus,
  ASSIGN_GLOBAL_ROLE_TO_USER: isAllowedAssignGlobalRoleToUser,
  ASSIGN_SOME_GLOBAL_ROLES: isAllowedAssignSomeGlobalRoles,
  CREATE_COHORTS: AcceleratorAdminPlus,
  READ_COHORTS: TFExpertPlus,
  UPDATE_COHORTS: AcceleratorAdminPlus,
  DELETE_COHORTS: AcceleratorAdminPlus,
  EXPORT_PARTICIPANTS: TFExpertPlus,
  CREATE_PARTICIPANTS: AcceleratorAdminPlus,
  READ_PARTICIPANTS: TFExpertPlus,
  UPDATE_PARTICIPANTS: TFExpertPlus,
  DELETE_PARTICIPANTS: AcceleratorAdminPlus,
  ASSIGN_PARTICIPANT_TO_COHORT: TFExpertPlus,
  READ_PROJECT_ACCELERATOR_DATA: ReadOnlyPlus,
  UPDATE_PARTICIPANT_PROJECT: TFExpertPlus,
  ASSIGN_PROJECT_TO_PARTICIPANT: TFExpertPlus,
  CREATE_SUBMISSION: isAllowedCreateSubmission,
  READ_DELIVERABLE: isAllowedReadDeliverable,
  READ_SUBMISSION_DOCUMENT: ReadOnlyPlus,
  UPDATE_SUBMISSION_STATUS: TFExpertPlus,
};

export const isAllowed: PermissionCheckFn = (
  user: User,
  permission: GlobalRolePermission,
  metadata?: unknown
): boolean => {
  const acl = ACL[permission];
  if (!acl) {
    return false;
  }

  // If it is an array of roles, validate the user has at least one of the allowed roles
  if (isArrayOfT<UserGlobalRole>(acl, isUserGlobalRole)) {
    return acl.some((role: UserGlobalRole) => user.globalRoles.includes(role));
  } else {
    // Otherwise the acl is a function, useful when there are more complicated rules
    return acl(user, permission, metadata);
  }
};
