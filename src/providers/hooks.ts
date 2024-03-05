import { useContext } from 'react';

import { LocalizationContext, OrganizationContext, UserContext } from './contexts';

export const useOrganization = () => useContext(OrganizationContext);

export const useTimeZones = () => useContext(LocalizationContext).supportedTimeZones;

export const useLocalization = () => useContext(LocalizationContext);

export const useUser = () => useContext(UserContext);
