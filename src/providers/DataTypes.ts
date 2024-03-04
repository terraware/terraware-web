import React from 'react';

import { Organization } from 'src/types/Organization';
import { TimeZoneDescription } from 'src/types/TimeZones';
import { User } from 'src/types/User';
import { GlobalRolePermission } from 'src/utils/acl';

export type PreferencesType = { [key: string]: unknown };

export type ProvidedUserData = {
  bootstrapped: boolean;
  isAllowed: (permission: GlobalRolePermission) => boolean;
  reloadUser: () => void;
  reloadUserPreferences: () => void;
  updateUserPreferences: (preferences: PreferencesType) => Promise<boolean>;
  user?: User;
  userPreferences: PreferencesType;
};

export type ProvidedOrganizationData = {
  selectedOrganization: Organization;
  setSelectedOrganization: React.Dispatch<React.SetStateAction<Organization | undefined>>;
  organizations: Organization[];
  orgPreferences: PreferencesType;
  reloadOrganizations: (selectedOrgId?: number) => void;
  reloadOrgPreferences: () => void;
  bootstrapped: boolean;
  orgPreferenceForId: number;
};

export type ProvidedLocalizationData = {
  /**
   * Which locale's strings are currently available from the "strings" module. This is usually what
   * you'll want to use if you need to reference the user's current locale.
   */
  activeLocale: string | null;
  /**
   * Which locale has been selected in the locale selector. Strings for this locale may not be
   * available yet if the user has just changed locales or if the page is still loading; only use
   * this if you don't need to look up anything from the "strings" module.
   */
  selectedLocale: string;
  setSelectedLocale: (locale: string) => void;
  supportedTimeZones: TimeZoneDescription[];
  bootstrapped: boolean;
};
