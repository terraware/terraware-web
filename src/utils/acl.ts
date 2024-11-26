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

/**
 * The main structure of the ACL functionality is a list of permissions with either an array of global roles
 * that have access OR a function that is executed to determine if there is access. In some instances
 * we need to look at some additional data in order to determine if the action is allowed, see `ASSIGN_GLOBAL_ROLE_TO_USER`.
 */

/**
 * We split the permissions up loosely by the entity that the user is being authorized to interact with or view
 */
type PermissionApplication =
  | 'READ_ALL_APPLICATIONS'
  | 'UPDATE_APPLICATION_INTERNAL_COMMENTS'
  | 'UPDATE_APPLICATION_STATUS';
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
type PermissionParticipantProject =
  | 'READ_PARTICIPANT_PROJECT'
  | 'UPDATE_PARTICIPANT_PROJECT'
  | 'ASSIGN_PROJECT_TO_PARTICIPANT'
  | 'VIEW_PARTICIPANT_PROJECT_SCORING_VOTING'
  | 'UPDATE_PARTICIPANT_PROJECT_SCORING_VOTING'
  | 'EXPORT_PARTICIPANT_PROJECT';

export type GlobalRolePermission =
  | PermissionApplication
  | PermissionCohort
  | PermissionConsole
  | PermissionDeliverable
  | PermissionGlobalRole
  | PermissionParticipant
  | PermissionParticipantProject;

type PermissionCheckFn<T = any> = (user: User, permission: GlobalRolePermission, metadata?: T) => boolean;

/**
 * Many of the permissions are "XYZ role _or higher_", so these RolePlus arrays are used in many cases
 */
const SuperAdminPlus: UserGlobalRoles = [GLOBAL_ROLE_SUPER_ADMIN];
const AcceleratorAdminPlus: UserGlobalRoles = [...SuperAdminPlus, GLOBAL_ROLE_ACCELERATOR_ADMIN];
const TFExpertPlus: UserGlobalRoles = [...AcceleratorAdminPlus, GLOBAL_ROLE_TF_EXPERT];
const ReadOnlyPlus: UserGlobalRoles = [...TFExpertPlus, GLOBAL_ROLE_READ_ONLY];

const isSuperAdmin = (user: User): boolean => user.globalRoles.includes(GLOBAL_ROLE_SUPER_ADMIN);
const isAcceleratorAdmin = (user: User): boolean =>
  isSuperAdmin(user) || user.globalRoles.includes(GLOBAL_ROLE_ACCELERATOR_ADMIN);
const isReadOnlyOrHigher = (user: User): boolean => ReadOnlyPlus.some((role) => user.globalRoles.includes(role));

/**
 * Functions related to authorization around global roles
 */
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

/**
 * Function related to creation of deliverable submissions, since the permission also applies to
 * org roles, we need to check the passed-in organization
 */
type CreateSubmissionMetadata = { organization: Organization };
const isAllowedCreateSubmission: PermissionCheckFn<CreateSubmissionMetadata> = (
  user: User,
  _: GlobalRolePermission,
  metadata?: CreateSubmissionMetadata
): boolean => {
  return isAcceleratorAdmin(user) || isManagerOrHigher(metadata?.organization);
};

/**
 * Function related to reading of deliverables, since the permission also applies to
 * org roles, we need to check the passed-in organization
 */
type ReadSubmissionMetadata = { organization: Organization };
const isAllowedReadDeliverable: PermissionCheckFn<ReadSubmissionMetadata> = (
  user: User,
  _: GlobalRolePermission,
  metadata?: ReadSubmissionMetadata
): boolean => {
  return isReadOnlyOrHigher(user) || isMember(metadata?.organization);
};

/**
 * This is the main ACL entrypoint where all permissions are indicated through a global role
 * array or a function that returns a boolean
 */
const ACL: Record<GlobalRolePermission, UserGlobalRoles | PermissionCheckFn> = {
  ASSIGN_GLOBAL_ROLE_TO_USER: isAllowedAssignGlobalRoleToUser,
  ASSIGN_PARTICIPANT_TO_COHORT: TFExpertPlus,
  ASSIGN_PROJECT_TO_PARTICIPANT: TFExpertPlus,
  ASSIGN_SOME_GLOBAL_ROLES: isAllowedAssignSomeGlobalRoles,
  CREATE_COHORTS: AcceleratorAdminPlus,
  CREATE_PARTICIPANTS: AcceleratorAdminPlus,
  CREATE_SUBMISSION: isAllowedCreateSubmission,
  DELETE_COHORTS: AcceleratorAdminPlus,
  DELETE_PARTICIPANTS: AcceleratorAdminPlus,
  EXPORT_PARTICIPANTS: ReadOnlyPlus,
  EXPORT_PARTICIPANT_PROJECT: ReadOnlyPlus,
  READ_ALL_APPLICATIONS: ReadOnlyPlus,
  READ_COHORTS: TFExpertPlus,
  READ_DELIVERABLE: isAllowedReadDeliverable,
  READ_GLOBAL_ROLES: AcceleratorAdminPlus,
  READ_PARTICIPANTS: TFExpertPlus,
  READ_PARTICIPANT_PROJECT: ReadOnlyPlus,
  READ_SUBMISSION_DOCUMENT: ReadOnlyPlus,
  UPDATE_APPLICATION_INTERNAL_COMMENTS: AcceleratorAdminPlus,
  UPDATE_APPLICATION_STATUS: TFExpertPlus,
  UPDATE_COHORTS: AcceleratorAdminPlus,
  UPDATE_PARTICIPANTS: AcceleratorAdminPlus,
  UPDATE_PARTICIPANT_PROJECT_SCORING_VOTING: TFExpertPlus,
  UPDATE_PARTICIPANT_PROJECT: TFExpertPlus,
  UPDATE_SUBMISSION_STATUS: TFExpertPlus,
  VIEW_CONSOLE: ReadOnlyPlus,
  VIEW_PARTICIPANT_PROJECT_SCORING_VOTING: TFExpertPlus,
};

/**
 * This is the main function that checks the permission, there is also a function of the same name within
 * the UserProvider that offers the same signature, but with the `user` already being baked in. That is
 * the function you want to use in most cases.
 */
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
