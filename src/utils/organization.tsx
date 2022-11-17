import { Facility, FacilityType } from 'src/api/types/facilities';
import { HighOrganizationRolesValues, ServerOrganization } from 'src/types/Organization';
import { OrganizationUser } from 'src/types/User';

export const getFacilitiesByType = (organization: ServerOrganization, type: FacilityType) => {
  let facilitiesByType: Facility[] = [];
  if (organization && organization.facilities) {
    facilitiesByType = organization?.facilities?.filter((facility) => facility.type === type);
  }
  return facilitiesByType;
};

export const getAllSeedBanks = (organization: ServerOrganization): (Facility | undefined)[] => {
  return getFacilitiesByType(organization, 'Seed Bank');
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

export const getAllNurseries = (organization: ServerOrganization): Facility[] => {
  return getFacilitiesByType(organization, 'Nursery');
};

export const getNurseriesById = (organization: ServerOrganization, id: number): Facility => {
  const allNurseries = getAllNurseries(organization);
  const found = allNurseries.filter((nurs) => nurs.id === id);
  return found[0];
};
