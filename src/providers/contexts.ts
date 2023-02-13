import { createContext } from 'react';
import { ProvidedLocalizationData, ProvidedOrganizationData, ProvidedUserData } from './DataTypes';
import { Organization } from '../types/Organization';

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

export const OrganizationContext = createContext<ProvidedOrganizationData>({
  organizations: [],
  orgPreferences: {},
  reloadOrganizations: (selectedOrgId?: number) => {
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
