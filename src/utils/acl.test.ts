import { User } from 'src/types/User';
import {
  GLOBAL_ROLE_ACCELERATOR_ADMIN,
  GLOBAL_ROLE_READ_ONLY,
  GLOBAL_ROLE_SUPER_ADMIN,
  GLOBAL_ROLE_TF_EXPERT,
  isAllowed,
} from './acl';

describe('isAllowed', () => {
  it('has the correct permissions for a user with the Super Admin global role', () => {
    const user: User = {
      id: 1,
      emailNotificationsEnabled: false,
      email: 'mock@email.com',
      globalRoles: [GLOBAL_ROLE_SUPER_ADMIN],
    };

    // Allowed Permissions
    expect(isAllowed(user, 'VIEW_CONSOLE')).toBeTruthy();
    expect(isAllowed(user, 'READ_GLOBAL_ROLES')).toBeTruthy();
    expect(isAllowed(user, 'CREATE_COHORTS')).toBeTruthy();
    expect(isAllowed(user, 'READ_COHORTS')).toBeTruthy();
    expect(isAllowed(user, 'UPDATE_COHORTS')).toBeTruthy();
    expect(isAllowed(user, 'DELETE_COHORTS')).toBeTruthy();
    expect(isAllowed(user, 'CREATE_PARTICIPANTS')).toBeTruthy();
    expect(isAllowed(user, 'READ_PARTICIPANTS')).toBeTruthy();
    expect(isAllowed(user, 'UPDATE_PARTICIPANTS')).toBeTruthy();
    expect(isAllowed(user, 'DELETE_PARTICIPANTS')).toBeTruthy();
    expect(isAllowed(user, 'ASSIGN_PARTICIPANT_TO_COHORT')).toBeTruthy();
    expect(isAllowed(user, 'READ_PROJECT_ACCELERATOR_DATA')).toBeTruthy();
    expect(isAllowed(user, 'UPDATE_PROJECT_ACCELERATOR_DATA')).toBeTruthy();
    expect(isAllowed(user, 'ASSIGN_PROJECT_TO_PARTICIPANT')).toBeTruthy();

    // Role to set must be passed for this rule
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER')).toBeFalsy();
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: GLOBAL_ROLE_SUPER_ADMIN })).toBeTruthy();
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: GLOBAL_ROLE_ACCELERATOR_ADMIN })).toBeTruthy();
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: GLOBAL_ROLE_TF_EXPERT })).toBeTruthy();
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: GLOBAL_ROLE_READ_ONLY })).toBeTruthy();
  });

  it('has the correct permissions for a user with the Accelerator Admin global role', () => {
    const user: User = {
      id: 1,
      emailNotificationsEnabled: false,
      email: 'mock@email.com',
      globalRoles: [GLOBAL_ROLE_ACCELERATOR_ADMIN],
    };

    // Allowed Permissions
    expect(isAllowed(user, 'VIEW_CONSOLE')).toBeTruthy();
    expect(isAllowed(user, 'READ_GLOBAL_ROLES')).toBeTruthy();
    expect(isAllowed(user, 'CREATE_COHORTS')).toBeTruthy();
    expect(isAllowed(user, 'READ_COHORTS')).toBeTruthy();
    expect(isAllowed(user, 'UPDATE_COHORTS')).toBeTruthy();
    expect(isAllowed(user, 'DELETE_COHORTS')).toBeTruthy();
    expect(isAllowed(user, 'CREATE_PARTICIPANTS')).toBeTruthy();
    expect(isAllowed(user, 'READ_PARTICIPANTS')).toBeTruthy();
    expect(isAllowed(user, 'UPDATE_PARTICIPANTS')).toBeTruthy();
    expect(isAllowed(user, 'DELETE_PARTICIPANTS')).toBeTruthy();
    expect(isAllowed(user, 'ASSIGN_PARTICIPANT_TO_COHORT')).toBeTruthy();
    expect(isAllowed(user, 'READ_PROJECT_ACCELERATOR_DATA')).toBeTruthy();
    expect(isAllowed(user, 'UPDATE_PROJECT_ACCELERATOR_DATA')).toBeTruthy();
    expect(isAllowed(user, 'ASSIGN_PROJECT_TO_PARTICIPANT')).toBeTruthy();

    // Role to set must be passed for this rule
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER')).toBeFalsy();
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: GLOBAL_ROLE_SUPER_ADMIN })).toBeFalsy();
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: GLOBAL_ROLE_ACCELERATOR_ADMIN })).toBeTruthy();
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: GLOBAL_ROLE_TF_EXPERT })).toBeTruthy();
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: GLOBAL_ROLE_READ_ONLY })).toBeTruthy();
  });

  it('has the correct permissions for a user with the TF Expert global role', () => {
    const user: User = {
      id: 1,
      emailNotificationsEnabled: false,
      email: 'mock@email.com',
      globalRoles: [GLOBAL_ROLE_TF_EXPERT],
    };

    // Allowed permissions
    expect(isAllowed(user, 'VIEW_CONSOLE')).toBeTruthy();
    expect(isAllowed(user, 'READ_COHORTS')).toBeTruthy();
    expect(isAllowed(user, 'READ_PARTICIPANTS')).toBeTruthy();
    expect(isAllowed(user, 'UPDATE_PARTICIPANTS')).toBeTruthy();
    expect(isAllowed(user, 'ASSIGN_PARTICIPANT_TO_COHORT')).toBeTruthy();
    expect(isAllowed(user, 'READ_PROJECT_ACCELERATOR_DATA')).toBeTruthy();
    expect(isAllowed(user, 'UPDATE_PROJECT_ACCELERATOR_DATA')).toBeTruthy();
    expect(isAllowed(user, 'ASSIGN_PROJECT_TO_PARTICIPANT')).toBeTruthy();

    // Not allowed permissions
    expect(isAllowed(user, 'READ_GLOBAL_ROLES')).toBeFalsy();
    expect(isAllowed(user, 'CREATE_COHORTS')).toBeFalsy();
    expect(isAllowed(user, 'UPDATE_COHORTS')).toBeFalsy();
    expect(isAllowed(user, 'DELETE_COHORTS')).toBeFalsy();
    expect(isAllowed(user, 'CREATE_PARTICIPANTS')).toBeFalsy();
    expect(isAllowed(user, 'DELETE_PARTICIPANTS')).toBeFalsy();

    // Role to set must be passed for this rule
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER')).toBeFalsy();
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: GLOBAL_ROLE_SUPER_ADMIN })).toBeFalsy();
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: GLOBAL_ROLE_ACCELERATOR_ADMIN })).toBeFalsy();
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: GLOBAL_ROLE_TF_EXPERT })).toBeFalsy();
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: GLOBAL_ROLE_READ_ONLY })).toBeFalsy();
  });

  it('has the correct permissions for a user with the Ready Only global role', () => {
    const user: User = {
      id: 1,
      emailNotificationsEnabled: false,
      email: 'mock@email.com',
      globalRoles: [GLOBAL_ROLE_READ_ONLY],
    };

    // Allowed permissions
    expect(isAllowed(user, 'VIEW_CONSOLE')).toBeTruthy();
    expect(isAllowed(user, 'READ_PROJECT_ACCELERATOR_DATA')).toBeTruthy();

    // Not allowed permissions
    expect(isAllowed(user, 'READ_GLOBAL_ROLES')).toBeFalsy();
    expect(isAllowed(user, 'READ_COHORTS')).toBeFalsy();
    expect(isAllowed(user, 'CREATE_COHORTS')).toBeFalsy();
    expect(isAllowed(user, 'UPDATE_COHORTS')).toBeFalsy();
    expect(isAllowed(user, 'DELETE_COHORTS')).toBeFalsy();
    expect(isAllowed(user, 'CREATE_PARTICIPANTS')).toBeFalsy();
    expect(isAllowed(user, 'READ_PARTICIPANTS')).toBeFalsy();
    expect(isAllowed(user, 'UPDATE_PARTICIPANTS')).toBeFalsy();
    expect(isAllowed(user, 'DELETE_PARTICIPANTS')).toBeFalsy();
    expect(isAllowed(user, 'ASSIGN_PARTICIPANT_TO_COHORT')).toBeFalsy();
    expect(isAllowed(user, 'UPDATE_PROJECT_ACCELERATOR_DATA')).toBeFalsy();
    expect(isAllowed(user, 'ASSIGN_PROJECT_TO_PARTICIPANT')).toBeFalsy();

    // Role to set must be passed for this rule
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER')).toBeFalsy();
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: GLOBAL_ROLE_SUPER_ADMIN })).toBeFalsy();
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: GLOBAL_ROLE_ACCELERATOR_ADMIN })).toBeFalsy();
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: GLOBAL_ROLE_TF_EXPERT })).toBeFalsy();
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: GLOBAL_ROLE_READ_ONLY })).toBeFalsy();
  });
});
