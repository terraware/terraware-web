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

import { isAdmin, isManagerOrHigher, isMember } from './organization';

/**
 * The main structure of the ACL functionality is a list of permissions with either an array of global roles
 * that have access OR a function that is executed to determine if there is access. In some instances
 * we need to look at some additional data in order to determine if the action is allowed, see `ASSIGN_GLOBAL_ROLE_TO_USER`.
 */

/**
 * We split the permissions up loosely by the entity that the user is being authorized to interact with or view
 */
type PermissionAcceleratorReports =
  | 'EDIT_REPORTS'
  | 'PUBLISH_REPORTS'
  | 'READ_REPORTS'
  | 'REVIEW_REPORTS_TARGETS'
  | 'UPDATE_REPORTS_SETTINGS'
  | 'UPDATE_REPORTS_TARGETS';
type PermissionActivities =
  | 'CREATE_ACTIVITIES'
  | 'DELETE_ACTIVITIES_NON_PUBLISHED'
  | 'DELETE_ACTIVITIES_PUBLISHED'
  | 'EDIT_ACTIVITIES'
  | 'READ_ACTIVITIES';
type PermissionApplication =
  | 'READ_ALL_APPLICATIONS'
  | 'UPDATE_APPLICATION_INTERNAL_COMMENTS'
  | 'UPDATE_APPLICATION_STATUS';
type PermissionCohort = 'CREATE_COHORTS' | 'READ_COHORTS' | 'UPDATE_COHORTS' | 'DELETE_COHORTS';
type PermissionConsole = 'VIEW_CONSOLE' | 'UPDATE_MATRIX_VIEW';
type PermissionDeliverable =
  | 'CREATE_SUBMISSION'
  | 'READ_DELIVERABLE'
  | 'READ_SUBMISSION_DOCUMENT'
  | 'UPDATE_SUBMISSION_STATUS'
  | 'UPDATE_DELIVERABLE';
type PermissionDocuments = 'CREATE_DOCUMENTS';
type PermissionFunder = 'READ_FUNDING_ENTITIES' | 'MANAGE_FUNDING_ENTITIES' | 'INVITE_FUNDER';
type PermissionGlobalRole = 'READ_GLOBAL_ROLES' | 'ASSIGN_GLOBAL_ROLE_TO_USER' | 'ASSIGN_SOME_GLOBAL_ROLES';
type PermissionObservations = 'UPDATE_PLANT_COUNTS';
type PermissionOrganization = 'CREATE_PLANTING_SITE';
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
  | 'EXPORT_PARTICIPANT_PROJECT'
  | 'PUBLISH_PROJECT_DETAILS';
type PermissionProjectModules = 'UPDATE_PROJECT_MODULES';
type PermissionSurvivalRate = 'EDIT_SURVIVAL_RATE_SETTINGS';

export type GlobalRolePermission =
  | PermissionAcceleratorReports
  | PermissionActivities
  | PermissionApplication
  | PermissionCohort
  | PermissionConsole
  | PermissionDeliverable
  | PermissionDocuments
  | PermissionFunder
  | PermissionGlobalRole
  | PermissionObservations
  | PermissionOrganization
  | PermissionParticipant
  | PermissionParticipantProject
  | PermissionProjectModules
  | PermissionSurvivalRate;

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
const isTFExpertOrHigher = (user: User): boolean =>
  isAcceleratorAdmin(user) || user.globalRoles.includes(GLOBAL_ROLE_TF_EXPERT);
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
 * Function related to edit survival rate settings, since the permission also applies to
 * org roles, we need to check the passed-in organization
 */
type EditSurvivalRateSettingsMetadata = { organization: Organization };
const isAllowedEditSurvivalRateSettings: PermissionCheckFn<EditSurvivalRateSettingsMetadata> = (
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
 * Function related to reading of accelerator reports, since the permission also applies to
 * org roles, we need to check the passed-in organization
 */
type ReadReportsMetadata = { organization: Organization };
const isAllowedReadReports: PermissionCheckFn<ReadReportsMetadata> = (
  user: User,
  _: GlobalRolePermission,
  metadata?: ReadReportsMetadata
): boolean => {
  return isAcceleratorAdmin(user) || isAdmin(metadata?.organization);
};

/**
 * Function related to reviewing accelerator reports targets
 */
const isAllowedReviewReportsTargets: PermissionCheckFn = (user: User): boolean => {
  return isTFExpertOrHigher(user);
};

/**
 * Function related to updating accelerator report targets, since the permission also applies to
 * org roles, we need to check the passed-in organization
 */
type UpdateReportsTargetsMetadata = { organization: Organization };
const isAllowedUpdateReportsTargets: PermissionCheckFn<UpdateReportsTargetsMetadata> = (
  user: User,
  _: GlobalRolePermission,
  metadata?: UpdateReportsTargetsMetadata
): boolean => {
  return isTFExpertOrHigher(user) || isAdmin(metadata?.organization);
};

type UpdatePlantCounts = { organization: Organization };
const isAllowedUpdatePlantCounts: PermissionCheckFn<UpdatePlantCounts> = (
  user: User,
  _: GlobalRolePermission,
  metadata?: UpdateReportsTargetsMetadata
): boolean => {
  return isTFExpertOrHigher(user) || isManagerOrHigher(metadata?.organization);
};

/**
 * Function related to funder invites
 */
const isAllowedInviteFunders: PermissionCheckFn = (user: User): boolean => {
  return isAcceleratorAdmin(user) || user?.userType === 'Funder';
};

/**
 * Function related to managing funding entities
 */
const isAllowedManageFundingEntities: PermissionCheckFn = (user: User): boolean => {
  return isAcceleratorAdmin(user) || user?.userType === 'Funder';
};

/**
 * Function related to reading activities, since the permission also applies to
 * org roles, we need to check the passed-in organization
 */
type ReadActivitiesMetadata = { organization: Organization };
const isAllowedReadActivities: PermissionCheckFn<ReadActivitiesMetadata> = (
  user: User,
  _: GlobalRolePermission,
  metadata?: ReadActivitiesMetadata
): boolean => {
  return isReadOnlyOrHigher(user) || isAdmin(metadata?.organization);
};

/**
 * Function related to creating activities, since the permission also applies to
 * org roles, we need to check the passed-in organization
 */
type CreateActivitiesMetadata = { organization: Organization };
const isAllowedCreateActivities: PermissionCheckFn<CreateActivitiesMetadata> = (
  user: User,
  _: GlobalRolePermission,
  metadata?: CreateActivitiesMetadata
): boolean => {
  return isTFExpertOrHigher(user) || isAdmin(metadata?.organization);
};

/**
 * Function related to editing activities, since the permission also applies to
 * org roles, we need to check the passed-in organization
 */
type EditActivitiesMetadata = { organization: Organization };
const isAllowedEditActivities: PermissionCheckFn<EditActivitiesMetadata> = (
  user: User,
  _: GlobalRolePermission,
  metadata?: EditActivitiesMetadata
): boolean => {
  return isTFExpertOrHigher(user) || isAdmin(metadata?.organization);
};

/**
 * Function related to deleting activities, since the permission also applies to
 * org roles, we need to check the passed-in organization
 */
type DeleteNonPublishedActivitiesMetadata = { organization: Organization };
const isAllowedDeleteNonPublishedActivities: PermissionCheckFn<DeleteNonPublishedActivitiesMetadata> = (
  user: User,
  _: GlobalRolePermission,
  metadata?: DeleteNonPublishedActivitiesMetadata
): boolean => {
  return isTFExpertOrHigher(user) || isAdmin(metadata?.organization);
};

/**
 * Function related to create planting site, since the permission also applies to
 * org roles, we need to check the passed-in organization
 */
type CreatePlantingSiteMetadata = { organization: Organization };
const isAllowedCreatePlantingSite: PermissionCheckFn<CreatePlantingSiteMetadata> = (
  user: User,
  _: GlobalRolePermission,
  metadata?: CreatePlantingSiteMetadata
) => isAcceleratorAdmin(user) || isAdmin(metadata?.organization);

/**
 * This is the main ACL entrypoint where all permissions are indicated through a global role
 * array or a function that returns a boolean
 */
const ACL: Record<GlobalRolePermission, UserGlobalRoles | PermissionCheckFn> = {
  ASSIGN_GLOBAL_ROLE_TO_USER: isAllowedAssignGlobalRoleToUser,
  ASSIGN_PARTICIPANT_TO_COHORT: TFExpertPlus,
  ASSIGN_PROJECT_TO_PARTICIPANT: TFExpertPlus,
  ASSIGN_SOME_GLOBAL_ROLES: isAllowedAssignSomeGlobalRoles,
  CREATE_ACTIVITIES: isAllowedCreateActivities,
  CREATE_COHORTS: AcceleratorAdminPlus,
  CREATE_DOCUMENTS: TFExpertPlus,
  CREATE_PARTICIPANTS: AcceleratorAdminPlus,
  CREATE_PLANTING_SITE: isAllowedCreatePlantingSite,
  CREATE_SUBMISSION: isAllowedCreateSubmission,
  DELETE_ACTIVITIES_NON_PUBLISHED: isAllowedDeleteNonPublishedActivities,
  DELETE_ACTIVITIES_PUBLISHED: AcceleratorAdminPlus,
  DELETE_COHORTS: AcceleratorAdminPlus,
  DELETE_PARTICIPANTS: AcceleratorAdminPlus,
  EDIT_ACTIVITIES: isAllowedEditActivities,
  EDIT_REPORTS: AcceleratorAdminPlus,
  EDIT_SURVIVAL_RATE_SETTINGS: isAllowedEditSurvivalRateSettings,
  EXPORT_PARTICIPANTS: ReadOnlyPlus,
  EXPORT_PARTICIPANT_PROJECT: ReadOnlyPlus,
  INVITE_FUNDER: isAllowedInviteFunders,
  MANAGE_FUNDING_ENTITIES: isAllowedManageFundingEntities,
  PUBLISH_PROJECT_DETAILS: AcceleratorAdminPlus,
  PUBLISH_REPORTS: AcceleratorAdminPlus,
  READ_ACTIVITIES: isAllowedReadActivities,
  READ_ALL_APPLICATIONS: ReadOnlyPlus,
  READ_COHORTS: TFExpertPlus,
  READ_DELIVERABLE: isAllowedReadDeliverable,
  READ_FUNDING_ENTITIES: ReadOnlyPlus,
  READ_GLOBAL_ROLES: AcceleratorAdminPlus,
  READ_PARTICIPANTS: TFExpertPlus,
  READ_PARTICIPANT_PROJECT: ReadOnlyPlus,
  READ_REPORTS: isAllowedReadReports,
  READ_SUBMISSION_DOCUMENT: ReadOnlyPlus,
  REVIEW_REPORTS_TARGETS: isAllowedReviewReportsTargets,
  UPDATE_APPLICATION_INTERNAL_COMMENTS: TFExpertPlus,
  UPDATE_APPLICATION_STATUS: TFExpertPlus,
  UPDATE_COHORTS: AcceleratorAdminPlus,
  UPDATE_DELIVERABLE: TFExpertPlus,
  UPDATE_MATRIX_VIEW: TFExpertPlus,
  UPDATE_PARTICIPANTS: AcceleratorAdminPlus,
  UPDATE_PARTICIPANT_PROJECT_SCORING_VOTING: TFExpertPlus,
  UPDATE_PLANT_COUNTS: isAllowedUpdatePlantCounts,
  UPDATE_REPORTS_SETTINGS: AcceleratorAdminPlus,
  UPDATE_REPORTS_TARGETS: isAllowedUpdateReportsTargets,
  UPDATE_PARTICIPANT_PROJECT: TFExpertPlus,
  UPDATE_PROJECT_MODULES: AcceleratorAdminPlus,
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
