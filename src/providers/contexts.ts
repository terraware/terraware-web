import { createContext } from 'react';
import { ProvidedUserData, ProvidedOrganizationData } from './DataTypes';

export const UserContext = createContext<ProvidedUserData>({
  reloadUser: () => {
    // default no-op implementation
    return;
  },
});

export const OrganizationContext = createContext<ProvidedOrganizationData>({
  reloadData: () => {
    // default no-op implementation
    return;
  },
  setSelectedOrganization: (org) => {
    // no-op
    return;
  },
  selectedOrganization: {
    id: -1,
    name: '',
    role: 'Contributor',
    totalUsers: 0,
  },
});
