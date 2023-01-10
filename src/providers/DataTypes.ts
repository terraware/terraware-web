import React from 'react';
import { User } from 'src/types/User';
import { ServerOrganization } from '../types/Organization';
import { TimeZoneDescription } from '../types/TimeZones';

export type ProvidedUserData = {
  user?: User;
  reloadUser: () => void;
};

export type ProvidedOrganizationData = {
  selectedOrganization: ServerOrganization;
  setSelectedOrganization: React.Dispatch<React.SetStateAction<ServerOrganization | undefined>>;
  organizations?: ServerOrganization[];
  reloadData: () => void;
};

export type ProvidedLocalizationData = {
  supportedTimeZones: TimeZoneDescription[];
  strings: { [key: string]: string };
};
