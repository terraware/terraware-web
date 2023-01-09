import { User } from 'src/types/User';
import { ServerOrganization } from '../types/Organization';
import React from 'react';

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

export type TimeZoneDescription = {
  id: string;
  longName: string;
};

export type ProvidedTimeZones = {
  supportedTimeZones: TimeZoneDescription[];
};
