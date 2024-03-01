import { User, UserGlobalRole, UserGlobalRoles } from 'src/types/User';
import { isArrayOfT } from 'src/types/utils';

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

type PermissionConsole = 'VIEW_CONSOLE';
type PermissionGlobalRole = 'READ_GLOBAL_ROLES' | 'ASSIGN_GLOBAL_ROLE_TO_USER';
type PermissionCohort = 'CREATE_COHORTS' | 'READ_COHORTS' | 'UPDATE_COHORTS' | 'DELETE_COHORTS';
type PermissionParticipant =
  | 'CREATE_PARTICIPANTS'
  | 'READ_PARTICIPANTS'
  | 'UPDATE_PARTICIPANTS'
  | 'DELETE_PARTICIPANTS'
  | 'ASSIGN_PARTICIPANT_TO_COHORT';
// This name might change, the entity doesn't exist yet. May end up adding extra properties to
// the "project"" entity or creating a new "project accelerator data" entity
type PermissionProjectAcceleratorData =
  | 'READ_PROJECT_ACCELERATOR_DATA'
  | 'UPDATE_PROJECT_ACCELERATOR_DATA'
  | 'ASSIGN_PROJECT_TO_PARTICIPANT';

export type GlobalRolePermission =
  | PermissionConsole
  | PermissionGlobalRole
  | PermissionCohort
  | PermissionParticipant
  | PermissionProjectAcceleratorData;

type PermissionCheckFn<T = any> = (user: User, permission: GlobalRolePermission, metadata?: T) => boolean;

export const GLOBAL_ROLE_SUPER_ADMIN: UserGlobalRole = 'Super-Admin';
export const GLOBAL_ROLE_ACCELERATOR_ADMIN: UserGlobalRole = 'Accelerator Admin';
export const GLOBAL_ROLE_TF_EXPERT: UserGlobalRole = 'TF Expert';
export const GLOBAL_ROLE_READ_ONLY: UserGlobalRole = 'Read Only';
const isUserGlobalRole = (input: unknown): input is UserGlobalRole =>
  [GLOBAL_ROLE_SUPER_ADMIN, GLOBAL_ROLE_ACCELERATOR_ADMIN, GLOBAL_ROLE_TF_EXPERT, GLOBAL_ROLE_READ_ONLY].includes(
    input as UserGlobalRole
  );

const SuperAdminPlus: UserGlobalRoles = [GLOBAL_ROLE_SUPER_ADMIN];
const AcceleratorAdminPlus: UserGlobalRoles = [...SuperAdminPlus, GLOBAL_ROLE_ACCELERATOR_ADMIN];
const TFExpertPlus: UserGlobalRoles = [...AcceleratorAdminPlus, GLOBAL_ROLE_TF_EXPERT];
const ReadOnlyPlus: UserGlobalRoles = [...TFExpertPlus, GLOBAL_ROLE_READ_ONLY];

const isSuperAdmin = (user: User): boolean => user.globalRoles.includes(GLOBAL_ROLE_SUPER_ADMIN);
const isAcceleratorAdmin = (user: User): boolean => user.globalRoles.includes(GLOBAL_ROLE_ACCELERATOR_ADMIN);

// This one is a bit more complicated because the permission is dependent on the role
type AssignGlobalRoleToUserMetadata = { roleToSet: UserGlobalRole };
const isAllowedAssignGlobalRoleToUser: PermissionCheckFn<AssignGlobalRoleToUserMetadata> = (
  user: User,
  _: GlobalRolePermission,
  metadata?: AssignGlobalRoleToUserMetadata
): boolean => {
  if (!metadata) {
    return false;
  } else if (isSuperAdmin(user)) {
    return true;
  } else if (isAcceleratorAdmin(user)) {
    // Accelerator admin can only assign accelerator admin, tf expert, and read only
    if (
      ([GLOBAL_ROLE_ACCELERATOR_ADMIN, GLOBAL_ROLE_TF_EXPERT, GLOBAL_ROLE_READ_ONLY] as UserGlobalRole[]).includes(
        metadata.roleToSet
      )
    ) {
      return true;
    }
  }

  return false;
};

// List of permissions and roles that have those permissions
const ACL: Record<GlobalRolePermission, UserGlobalRoles | PermissionCheckFn> = {
  VIEW_CONSOLE: ReadOnlyPlus,
  READ_GLOBAL_ROLES: AcceleratorAdminPlus,
  ASSIGN_GLOBAL_ROLE_TO_USER: isAllowedAssignGlobalRoleToUser,
  CREATE_COHORTS: AcceleratorAdminPlus,
  READ_COHORTS: TFExpertPlus,
  UPDATE_COHORTS: AcceleratorAdminPlus,
  DELETE_COHORTS: AcceleratorAdminPlus,
  CREATE_PARTICIPANTS: AcceleratorAdminPlus,
  READ_PARTICIPANTS: TFExpertPlus,
  UPDATE_PARTICIPANTS: TFExpertPlus,
  DELETE_PARTICIPANTS: AcceleratorAdminPlus,
  ASSIGN_PARTICIPANT_TO_COHORT: TFExpertPlus,
  READ_PROJECT_ACCELERATOR_DATA: ReadOnlyPlus,
  UPDATE_PROJECT_ACCELERATOR_DATA: TFExpertPlus,
  ASSIGN_PROJECT_TO_PARTICIPANT: TFExpertPlus,
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
