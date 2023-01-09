import { useContext } from 'react';
import { LocalizationContext, OrganizationContext, UserContext } from './contexts';

export const useUser = () => useContext(UserContext);

export const useTimeZones = () => useContext(LocalizationContext);

export const useOrganization = () => useContext(OrganizationContext);
