import { useContext } from 'react';
import { OrganizationContext, UserContext } from './contexts';

export const useUser = () => useContext(UserContext);

export const useOrganization = () => useContext(OrganizationContext);
