import { FacilityPayload } from 'src/queries/generated/organizations';
import { Organization } from 'src/types/Organization';

export const buildFacility = (overrides: Partial<FacilityPayload> = {}): FacilityPayload => ({
  id: 100,
  createdTime: '2024-01-01T00:00:00Z',
  facilityNumber: 1,
  name: 'Test Nursery',
  organizationId: 1,
  type: 'Nursery',
  connectionState: 'Not Connected',
  timeZone: 'America/Los_Angeles',
  ...overrides,
});

export const buildSeedBank = (overrides: Partial<FacilityPayload> = {}): FacilityPayload =>
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
  createdTime: '2024-01-01T00:00:00Z',
  facilities: [buildFacility()],
  ...overrides,
});
