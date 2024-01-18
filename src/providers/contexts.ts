import { createContext } from 'react';
import { Organization } from 'src/types/Organization';
import { FacilityType } from 'src/types/Facility';
import { ProvidedLocalizationData, ProvidedOrganizationData, ProvidedUserData } from './DataTypes';

export const UserContext = createContext<ProvidedUserData>({
  reloadUser: () => {
    // default no-op implementation
    return;
  },
  reloadUserPreferences: () => {
    // default no-op implementation
    return;
  },
  userPreferences: {},
  bootstrapped: false,
  updateUserPreferences: () => Promise.resolve(true),
});

export const defaultSelectedOrg: Organization = {
  id: -1,
  name: '',
  role: 'Contributor',
  totalUsers: 0,
};

export const isPlaceholderOrg = (id: number | undefined) => !id || id === defaultSelectedOrg.id;

export const selectedOrgHasFacilityType = (organization: Organization, facilityType: FacilityType): boolean => {
  if (!isPlaceholderOrg(organization?.id) && organization?.facilities) {
    return organization.facilities.some((facility: any) => {
      return facility.type === facilityType;
    });
  } else {
    return false;
  }
};

export const OrganizationContext = createContext<ProvidedOrganizationData>({
  organizations: [],
  orgPreferences: {},
  reloadOrganizations: (selectedOrgId?: number) => {
    // default no-op implementation
    return;
  },
  reloadOrgPreferences: () => {
    // default no-op implementation
    return;
  },
  setSelectedOrganization: (org) => {
    // no-op
    return;
  },

  selectedOrganization: defaultSelectedOrg,
  bootstrapped: false,
  orgPreferenceForId: -1,
});

export const LocalizationContext = createContext<ProvidedLocalizationData>({
  activeLocale: null,
  selectedLocale: 'en',
  setSelectedLocale: () => undefined,
  supportedTimeZones: [],
  bootstrapped: false,
});
