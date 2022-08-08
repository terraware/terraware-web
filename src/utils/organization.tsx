import { Facility } from 'src/api/types/facilities';
import { HighOrganizationRolesValues, ServerOrganization } from 'src/types/Organization';

export const getAllSeedBanks = (organization: ServerOrganization): (Facility | undefined)[] => {
  let seedBanks: (Facility | undefined)[] = [];
  if (organization && organization.facilities) {
    seedBanks = organization?.facilities?.filter((facility) => facility.type === 'Seed Bank');
  }
  return seedBanks;
};

export const isAdmin = (organization: ServerOrganization | undefined) => {
  return HighOrganizationRolesValues.includes(organization?.role || '');
};
