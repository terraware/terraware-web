import { Facility } from 'src/types/Facility';
import { Organization } from 'src/types/Organization';

export const buildFacility = (overrides: Partial<Facility> = {}): Facility => ({
  id: 100,
  name: 'Test Nursery',
  organizationId: 1,
  type: 'Nursery',
  connectionState: 'Not Connected',
  timeZone: 'America/Los_Angeles',
  ...overrides,
});

export const buildSeedBank = (overrides: Partial<Facility> = {}): Facility =>
  buildFacility({ id: 101, name: 'Test Seed Bank', type: 'Seed Bank', ...overrides });

/**
 * An organization the current user owns, with one nursery. `role` drives most of the permission
 * checks in `src/utils/acl`, so tests exercising permission-gated UI should override it.
 */
export const buildOrganization = (overrides: Partial<Organization> = {}): Organization => ({
  id: 1,
  name: 'Test Organization',
  role: 'Owner',
  totalUsers: 1,
  organizationType: 'NGO',
  countryCode: 'US',
  timeZone: 'America/Los_Angeles',
  canSubmitReports: false,
  facilities: [buildFacility()],
  ...overrides,
});
