import { Facility } from 'src/api/types/facilities';
import { HighOrganizationRolesValues, ServerOrganization } from 'src/types/Organization';
import { OrganizationUser } from 'src/types/User';

export const getAllSeedBanks = (organization: ServerOrganization): (Facility | undefined)[] => {
  let seedBanks: (Facility | undefined)[] = [];
  if (organization && organization.facilities) {
    seedBanks = organization?.facilities?.filter((facility) => facility.type === 'Seed Bank');
  }
  return seedBanks;
};

export const getSeedBank = (organization: ServerOrganization, facilityId: number): Facility | undefined => {
  return getAllSeedBanks(organization).find((sb) => sb?.id === facilityId);
};

export const isAdmin = (organization: ServerOrganization | undefined) => {
  return HighOrganizationRolesValues.includes(organization?.role || '');
};

export const isContributor = (roleHolder: ServerOrganization | OrganizationUser | undefined) => {
  return roleHolder?.role === 'Contributor';
};

export const getAllNurseries = (organization: ServerOrganization): (Facility | undefined)[] => {
  let nurseries: (Facility | undefined)[] = [];
  if (organization && organization.facilities) {
    nurseries = organization?.facilities?.filter((facility) => facility.type === 'Nursery');
  }
  return nurseries;
};
