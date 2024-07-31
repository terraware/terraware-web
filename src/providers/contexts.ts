import { createContext } from 'react';

import { Organization } from 'src/types/Organization';
import { GlobalRolePermission } from 'src/utils/acl';

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
  updateUserCookieConsent: () => Promise.resolve(),
  updateUserPreferences: () => Promise.resolve(true),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isAllowed: (_: GlobalRolePermission, __?: unknown) => false,
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  redirectAndNotify: (organization: Organization) => {
    // default no-op implementation
    return;
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  reloadOrganizations: (selectedOrgId?: number) => {
    // default no-op implementation
    return Promise.resolve();
  },
  reloadOrgPreferences: () => {
    // default no-op implementation
    return;
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
