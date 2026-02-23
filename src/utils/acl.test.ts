import { User } from 'src/types/User';
import { isAllowed } from './acl';
import { GLOBAL_ROLE_ACCELERATOR_ADMIN, GLOBAL_ROLE_READ_ONLY, GLOBAL_ROLE_SUPER_ADMIN, GLOBAL_ROLE_TF_EXPERT } from 'src/types/GlobalRoles';

describe('isAllowed', () => {
  it('has the correct permissions for a user with the Super Admin global role', () => {
    const user: User = {
      id: 1,
      emailNotificationsEnabled: false,
      email: 'mock@email.com',
      globalRoles: [GLOBAL_ROLE_SUPER_ADMIN],
      userType: 'Individual'
    };

    // Allowed Permissions
    expect(isAllowed(user, 'VIEW_CONSOLE')).toBeTruthy();
    expect(isAllowed(user, 'READ_GLOBAL_ROLES')).toBeTruthy();
    expect(isAllowed(user, 'READ_ACCELERATOR_PROJECT')).toBeTruthy();
    expect(isAllowed(user, 'UPDATE_ACCELERATOR_PROJECT')).toBeTruthy();

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
      userType: 'Individual'
    };

    // Allowed Permissions
    expect(isAllowed(user, 'VIEW_CONSOLE')).toBeTruthy();
    expect(isAllowed(user, 'READ_GLOBAL_ROLES')).toBeTruthy();
    expect(isAllowed(user, 'READ_ACCELERATOR_PROJECT')).toBeTruthy();
    expect(isAllowed(user, 'UPDATE_ACCELERATOR_PROJECT')).toBeTruthy();

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
      userType: 'Individual'
    };

    // Allowed permissions
    expect(isAllowed(user, 'VIEW_CONSOLE')).toBeTruthy();
    expect(isAllowed(user, 'READ_ACCELERATOR_PROJECT')).toBeTruthy();
    expect(isAllowed(user, 'UPDATE_ACCELERATOR_PROJECT')).toBeTruthy();

    // Not allowed permissions
    expect(isAllowed(user, 'READ_GLOBAL_ROLES')).toBeFalsy();

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
      userType: 'Individual'
    };

    // Allowed permissions
    expect(isAllowed(user, 'VIEW_CONSOLE')).toBeTruthy();
    expect(isAllowed(user, 'READ_ACCELERATOR_PROJECT')).toBeTruthy();

    // Not allowed permissions
    expect(isAllowed(user, 'READ_GLOBAL_ROLES')).toBeFalsy();
    expect(isAllowed(user, 'UPDATE_ACCELERATOR_PROJECT')).toBeFalsy();

    // Role to set must be passed for this rule
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER')).toBeFalsy();
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: GLOBAL_ROLE_SUPER_ADMIN })).toBeFalsy();
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: GLOBAL_ROLE_ACCELERATOR_ADMIN })).toBeFalsy();
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: GLOBAL_ROLE_TF_EXPERT })).toBeFalsy();
    expect(isAllowed(user, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: GLOBAL_ROLE_READ_ONLY })).toBeFalsy();
  });
});
