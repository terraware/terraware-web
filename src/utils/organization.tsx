import { Facility, FacilityType } from 'src/types/Facility';
import { HighOrganizationRolesValues, Organization } from 'src/types/Organization';
import { OrganizationUser } from 'src/types/User';

export const getFacilitiesByType = (organization: Organization, type: FacilityType) => {
  let facilitiesByType: Facility[] = [];
  if (organization && organization.facilities) {
    facilitiesByType = organization?.facilities?.filter((facility) => facility.type === type);
  }
  return facilitiesByType;
};

export const getAllSeedBanks = (organization: Organization): Facility[] => {
  return getFacilitiesByType(organization, 'Seed Bank');
};

export const getSeedBank = (organization: Organization, facilityId: number): Facility | undefined => {
  return getAllSeedBanks(organization).find((sb) => sb?.id === facilityId);
};

export const isAdmin = (organization: Organization | undefined) => {
  return HighOrganizationRolesValues.includes(organization?.role || '');
};

export const isContributor = (roleHolder: Organization | OrganizationUser | undefined) => {
  return roleHolder?.role === 'Contributor';
};

export const getAllNurseries = (organization: Organization): Facility[] => {
  return getFacilitiesByType(organization, 'Nursery');
};

export const getNurseryById = (organization: Organization, id: number): Facility => {
  const allNurseries = getAllNurseries(organization);
  const found = allNurseries.filter((nurs) => nurs.id.toString() === id.toString());
  return found[0];
};
