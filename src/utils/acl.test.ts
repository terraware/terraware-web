import { User } from 'src/types/User';
import { isAllowed } from './acl';
import { GLOBAL_ROLE_ACCELERATOR_ADMIN, GLOBAL_ROLE_READ_ONLY, GLOBAL_ROLE_SUPER_ADMIN, GLOBAL_ROLE_TF_EXPERT } from 'src/types/GlobalRoles';
import { Organization, OrganizationRole } from 'src/types/Organization';
import { ProjectPayload } from 'src/queries/generated/projects';
import { ACCESSION_2_STATES, Accession, AccessionState } from 'src/types/Accession';

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

  /**
   * Accession rules combine an organization role with the accession's own state.
   */
  describe('accession permissions', () => {
    const user: User = {
      id: 1,
      emailNotificationsEnabled: false,
      email: 'mock@email.com',
      globalRoles: [],
      userType: 'Individual',
    };

    const org = (role: OrganizationRole): Organization => ({ id: 1, name: 'Org 1', totalUsers: 1, role });
    const accession = (state: AccessionState, estimatedCount?: number) => ({ state, estimatedCount }) as Accession;

    /** Every organization role that is not Contributor. */
    const EDITING_ROLES: OrganizationRole[] = ['Owner', 'Admin', 'Manager', 'Terraformation Contact'];

    const IN_STORAGE = accession('In Storage', 100);

    describe('EDIT_ACCESSION', () => {
      EDITING_ROLES.forEach((role) => {
        it(`allows a ${role}`, () => {
          expect(isAllowed(user, 'EDIT_ACCESSION', { organization: org(role) })).toBe(true);
        });
      });

      it('does not allow a Contributor', () => {
        expect(isAllowed(user, 'EDIT_ACCESSION', { organization: org('Contributor') })).toBe(false);
      });

      it('does not allow a user with no organization', () => {
        expect(isAllowed(user, 'EDIT_ACCESSION', { organization: undefined })).toBe(false);
        expect(isAllowed(user, 'EDIT_ACCESSION')).toBe(false);
      });

      it('is not granted by a global role', () => {
        const superAdmin: User = { ...user, globalRoles: [GLOBAL_ROLE_SUPER_ADMIN] };
        expect(isAllowed(superAdmin, 'EDIT_ACCESSION', { organization: org('Contributor') })).toBe(false);
        expect(isAllowed(superAdmin, 'EDIT_ACCESSION', { organization: undefined })).toBe(false);
      });
    });

    describe('DELETE_ACCESSION', () => {
      it('allows an Admin and refuses a Contributor', () => {
        expect(isAllowed(user, 'DELETE_ACCESSION', { organization: org('Admin') })).toBe(true);
        expect(isAllowed(user, 'DELETE_ACCESSION', { organization: org('Contributor') })).toBe(false);
      });

      it('does not depend on the accession state', () => {
        ACCESSION_2_STATES.forEach((state) => {
          expect(
            isAllowed(user, 'DELETE_ACCESSION', { organization: org('Admin'), accession: accession(state, 100) })
          ).toBe(true);
        });
      });
    });

    describe('EDIT_ACCESSION_QUANTITY', () => {
      it('is allowed in every state except Used Up', () => {
        ACCESSION_2_STATES.forEach((state) => {
          expect(
            isAllowed(user, 'EDIT_ACCESSION_QUANTITY', {
              organization: org('Admin'),
              accession: accession(state, 100),
            })
          ).toBe(state !== 'Used Up');
        });
      });

      it('is refused for a Contributor even when the accession is editable', () => {
        expect(
          isAllowed(user, 'EDIT_ACCESSION_QUANTITY', { organization: org('Contributor'), accession: IN_STORAGE })
        ).toBe(false);
      });
    });

    describe('EDIT_ACCESSION_STATE', () => {
      it('is allowed in every state except Awaiting Check-In', () => {
        ACCESSION_2_STATES.forEach((state) => {
          expect(
            isAllowed(user, 'EDIT_ACCESSION_STATE', { organization: org('Admin'), accession: accession(state, 100) })
          ).toBe(state !== 'Awaiting Check-In');
        });
      });

      it('is refused for a Contributor even when the accession is editable', () => {
        expect(
          isAllowed(user, 'EDIT_ACCESSION_STATE', { organization: org('Contributor'), accession: IN_STORAGE })
        ).toBe(false);
      });
    });

    describe('EDIT_ACCESSION_VIABILITY', () => {
      it('is allowed in every state except Used Up, when there is an estimated count', () => {
        ACCESSION_2_STATES.forEach((state) => {
          expect(
            isAllowed(user, 'EDIT_ACCESSION_VIABILITY', {
              organization: org('Admin'),
              accession: accession(state, 100),
            })
          ).toBe(state !== 'Used Up');
        });
      });

      // Viability is recorded against an estimated seed count, so without one there is nothing to
      // record against — in any state, for any role.
      it('is refused when there is no estimated count', () => {
        ACCESSION_2_STATES.forEach((state) => {
          expect(
            isAllowed(user, 'EDIT_ACCESSION_VIABILITY', {
              organization: org('Admin'),
              accession: accession(state, undefined),
            })
          ).toBe(false);
        });
      });

      it('treats a zero estimated count as present', () => {
        expect(
          isAllowed(user, 'EDIT_ACCESSION_VIABILITY', {
            organization: org('Admin'),
            accession: accession('In Storage', 0),
          })
        ).toBe(true);
      });

      it('is refused for a Contributor even when the accession is editable', () => {
        expect(
          isAllowed(user, 'EDIT_ACCESSION_VIABILITY', { organization: org('Contributor'), accession: IN_STORAGE })
        ).toBe(false);
      });
    });

    // The three narrower permissions are all refusals when the accession has not loaded yet, so a
    // view rendering before its fetch resolves offers nothing it should not.
    it('refuses the state-dependent permissions when the accession is missing', () => {
      const metadata = { organization: org('Admin') };
      expect(isAllowed(user, 'EDIT_ACCESSION', metadata)).toBe(true);
      expect(isAllowed(user, 'EDIT_ACCESSION_VIABILITY', metadata)).toBe(false);
      // Quantity and state only exclude one specific state each, so an absent accession does not
      // match the exclusion and stays allowed. Documented rather than asserted as desirable.
      expect(isAllowed(user, 'EDIT_ACCESSION_QUANTITY', metadata)).toBe(true);
      expect(isAllowed(user, 'EDIT_ACCESSION_STATE', metadata)).toBe(true);
    });
  });
});
