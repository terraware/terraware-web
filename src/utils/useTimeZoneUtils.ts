import { useOrganization, useTimeZones, useUser } from 'src/providers';

import { TimeZoneDescription } from 'src/types/TimeZones';

type Location = {
  timeZone?: string;
};

const DEFAULT_UTC = { id: 'Etc/UTC', longName: 'Coordinated Universal Time' };

const getTimeZone = (timeZones: TimeZoneDescription[], id?: string): TimeZoneDescription | undefined => {
  if (!id) {
    return undefined;
  }
  return timeZones.find((tz) => tz.id === id);
};

/**
 * Helper function to return UTC as per the supported time zones list
 */
export const getUTC = (timeZones: TimeZoneDescription[]): TimeZoneDescription => {
  return getTimeZone(timeZones, DEFAULT_UTC.id) ?? DEFAULT_UTC;
};

/**
 * Get a fallback time zone (based on org, user, etc.)
 */
export const useDefaultTimeZone = () => {
  const { user } = useUser();
  const { selectedOrganization } = useOrganization();
  const timeZones = useTimeZones();

  const orgTimeZone = getTimeZone(timeZones, selectedOrganization.timeZone);
  if (orgTimeZone) {
    return orgTimeZone;
  }

  const userTimeZone = getTimeZone(timeZones, user?.timeZone);
  if (userTimeZone) {
    return userTimeZone;
  }

  return getUTC(timeZones);
};

/**
 * Get a fallback time zone for a location (based on location org, user, etc.)
 */
export const useLocationTimeZone = (location: Location) => {
  const timeZones = useTimeZones();

  return getTimeZone(timeZones, location.timeZone) ?? useDefaultTimeZone();
};

// TODO - add more utilities as we see fit
