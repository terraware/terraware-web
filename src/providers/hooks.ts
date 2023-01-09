import { useContext } from 'react';
import { OrganizationContext, UserContext } from './contexts';

export const useUser = () => useContext(UserContext);

/**
 * Default time zones until we have a provider.
 */
// const DEFAULT_TIME_ZONES = (Intl as any).supportedValuesOf('timeZone').map((tz: any) => ({ id: tz, longName: tz }));
// const SUPPORTED_TIME_ZONES = [...DEFAULT_TIME_ZONES, { id: 'Etc/UTC', longName: 'Coordinated Universal Time' }];

export const useTimeZones = () => [];

export const useOrganization = () => useContext(OrganizationContext);
