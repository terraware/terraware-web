import { User } from 'src/types/User';

/**
 * A plain individual user with no global roles. Override anything the test actually cares about;
 * leave the rest alone so the intent of the test stays readable.
 *
 * ```ts
 * buildUser({ firstName: 'Ada', globalRoles: ['Super-Admin'] })
 * ```
 */
export const buildUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  email: 'test-user@terraware.io',
  firstName: 'Test',
  lastName: 'User',
  emailNotificationsEnabled: false,
  globalRoles: [],
  locale: 'en',
  timeZone: 'America/Los_Angeles',
  countryCode: 'US',
  userType: 'Individual',
  ...overrides,
});

export const buildAcceleratorAdmin = (overrides: Partial<User> = {}): User =>
  buildUser({ globalRoles: ['Accelerator Admin'], ...overrides });

export const buildFunderUser = (overrides: Partial<User> = {}): User => buildUser({ userType: 'Funder', ...overrides });
