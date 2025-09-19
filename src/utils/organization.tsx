import strings from 'src/strings';
import { Facility, FacilityType } from 'src/types/Facility';
import { HighOrganizationRolesValues, Organization, OrganizationRole } from 'src/types/Organization';
import { OrganizationUser } from 'src/types/User';

export const getFacilitiesByType = (organization: Organization, type: FacilityType, locale?: string) => {
  let facilitiesByType: Facility[] = [];
  if (organization && organization.facilities) {
    facilitiesByType = organization?.facilities
      ?.filter((facility) => facility.type === type)
      .sort((a, b) => a.name.localeCompare(b.name, locale));
  }
  return facilitiesByType;
};

export const getAllSeedBanks = (organization: Organization): Facility[] => {
  return getFacilitiesByType(organization, 'Seed Bank');
};

export const getSeedBank = (organization: Organization, facilityId: number): Facility | undefined => {
  return getAllSeedBanks(organization).find((sb) => sb?.id === facilityId);
};

export const isOwner = <T extends Organization>(organization: T | undefined): organization is T => {
  return organization?.role === 'Owner';
};

export const isAdmin = <T extends Organization>(organization: T | undefined): organization is T =>
  HighOrganizationRolesValues.includes(organization?.role || '');

export const isManagerOrHigher = <T extends Organization>(organization: T | undefined): organization is T => {
  return organization?.role === 'Manager' || isAdmin(organization);
};

export const isMember = <T extends Organization>(organization: T | undefined): organization is T => {
  return !!organization;
};

export const isTfContact = (role: OrganizationRole | undefined) => role?.includes(strings.TERRAFORMATION_CONTACT);

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

export const isPlaceholderOrg = (id: number | undefined) => !id;

export const selectedOrgHasFacilityType = (organization: Organization, facilityType: FacilityType): boolean => {
  if (!isPlaceholderOrg(organization?.id) && organization?.facilities) {
    return organization.facilities.some((facility: Facility) => {
      return facility.type === facilityType;
    });
  } else {
    return false;
  }
};
