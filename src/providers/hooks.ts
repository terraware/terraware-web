import { useContext, useMemo } from 'react';
import { OrganizationContext, UserContext } from './contexts';

export const useUser = () => useContext(UserContext);

/**
 * Default time zones until we have a provider.
 */
export const useTimeZones = () => useMemo(() => {
  const defaultTimeZones = (Intl as any).supportedValuesOf('timeZone').map((tz: any) => ({ id: tz, longName: tz }));
  const supportedTimeZones = [...defaultTimeZones, { id: 'Etc/UTC', longName: 'Coordinated Universal Time' }];
  return supportedTimeZones;
}, []);

export const useOrganization = () => useContext(OrganizationContext);
