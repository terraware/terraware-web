import React from 'react';
import { User } from 'src/types/User';
import { Organization } from '../types/Organization';
import { TimeZoneDescription } from '../types/TimeZones';

export type PreferencesType = { [key: string]: unknown };

export type ProvidedUserData = {
  user?: User;
  reloadUser: () => void;
  bootstrapped: boolean;
};

export type ProvidedOrganizationData = {
  selectedOrganization: Organization;
  setSelectedOrganization: React.Dispatch<React.SetStateAction<Organization | undefined>>;
  organizations: Organization[];
  userPreferences: PreferencesType;
  orgPreferences: PreferencesType;
  reloadData: (selectedOrgId?: number) => void;
  reloadPreferences: () => void;
  bootstrapped: boolean;
  orgPreferenceForId: number;
};

export type ProvidedLocalizationData = {
  locale: string;
  supportedTimeZones: TimeZoneDescription[];
  setLocale: (locale: string) => void;
  loadedStringsForLocale: string | null;
  bootstrapped: boolean;
};
