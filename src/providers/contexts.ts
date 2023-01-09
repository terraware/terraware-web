import { createContext } from 'react';
import { ProvidedUserData, ProvidedOrganizationData } from './DataTypes';
import { ServerOrganization } from '../types/Organization';

export const UserContext = createContext<ProvidedUserData>({
  reloadUser: () => {
    // default no-op implementation
    return;
  },
});

export const defaultSelectedOrg: ServerOrganization = {
  id: -1,
  name: '',
  role: 'Contributor',
  totalUsers: 0,
};

export const OrganizationContext = createContext<ProvidedOrganizationData>({
  reloadData: () => {
    // default no-op implementation
    return;
  },
  setSelectedOrganization: (org) => {
    // no-op
    return;
  },
  selectedOrganization: defaultSelectedOrg,
});
