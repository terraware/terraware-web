import { useContext } from 'react';
import { LocalizationContext, OrganizationContext, UserContext } from './contexts';

export const useOrganization = () => useContext(OrganizationContext);

export const useStrings = () => useContext(LocalizationContext).strings;

export const useTimeZones = () => useContext(LocalizationContext).supportedTimeZones;

export const useUser = () => useContext(UserContext);
