import { createContext } from 'react';
import { ProvidedUserData, ProvidedOrganizationData, ProvidedLocalizationData } from './DataTypes';
import { Organization } from '../types/Organization';

export const UserContext = createContext<ProvidedUserData>({
  reloadUser: () => {
    // default no-op implementation
    return;
  },
  bootstrapped: false,
});

export const defaultSelectedOrg: Organization = {
  id: -1,
  name: '',
  role: 'Contributor',
  totalUsers: 0,
};

export const OrganizationContext = createContext<ProvidedOrganizationData>({
  organizations: [],
  userPreferences: {},
  orgPreferences: {},
  reloadData: (selectedOrgId?: number) => {
    // default no-op implementation
    return;
  },
  reloadPreferences: () => {
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
  loadedStringsForLocale: null,
  locale: 'en',
  setLocale: () => undefined,
  supportedTimeZones: [],
  bootstrapped: false,
});
