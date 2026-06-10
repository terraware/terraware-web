import { User } from 'src/types/User';
import { isAllowed } from './acl';
import { GLOBAL_ROLE_ACCELERATOR_ADMIN, GLOBAL_ROLE_READ_ONLY, GLOBAL_ROLE_SUPER_ADMIN, GLOBAL_ROLE_TF_EXPERT } from 'src/types/GlobalRoles';
import { Organization } from 'src/types/Organization';
import { ProjectPayload } from 'src/queries/generated/projects';

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

  it('has the correct permissions for VIEW_ORG_OBSERVATIONS', () => {
    const noRolesUser: User = {
      id: 1,
      emailNotificationsEnabled: false,
      email: 'mock@email.com',
      globalRoles: [],
      userType: 'Individual',
    };
    const org = (id: number): Organization => ({ id, name: `Org ${id}`, totalUsers: 1 });
    const project = (organizationId: number) => ({ id: 1, name: 'Project', organizationId } as ProjectPayload);

    // Non-accelerator route: always allowed regardless of org membership
    expect(isAllowed(noRolesUser, 'VIEW_ORG_OBSERVATIONS', { organizations: [], project: undefined, isAcceleratorRoute: false })).toBeTruthy();
    expect(isAllowed(noRolesUser, 'VIEW_ORG_OBSERVATIONS', { organizations: [org(1)], project: project(1), isAcceleratorRoute: false })).toBeTruthy();

    // Accelerator route: allowed only when the project's org is in the user's orgs
    expect(isAllowed(noRolesUser, 'VIEW_ORG_OBSERVATIONS', { organizations: [org(1), org(2)], project: project(2), isAcceleratorRoute: true })).toBeTruthy();
    expect(isAllowed(noRolesUser, 'VIEW_ORG_OBSERVATIONS', { organizations: [org(1), org(2)], project: project(3), isAcceleratorRoute: true })).toBeFalsy();
    expect(isAllowed(noRolesUser, 'VIEW_ORG_OBSERVATIONS', { organizations: [], project: project(1), isAcceleratorRoute: true })).toBeFalsy();
    expect(isAllowed(noRolesUser, 'VIEW_ORG_OBSERVATIONS', { organizations: [org(1)], project: undefined, isAcceleratorRoute: true })).toBeFalsy();
  });
});
