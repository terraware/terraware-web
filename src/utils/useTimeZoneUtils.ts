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
 * util to get time zone or default to UTC
 */
export const useGetTimeZone = () => {
  const timeZones = useTimeZones();
  const defaultTz = useDefaultTimeZone();
  return {
    get: (id: string): TimeZoneDescription => getTimeZone(timeZones, id) ?? defaultTz.get(),
  };
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

  return {
    get: (forEdit?: boolean) => {
      const orgTimeZone = getTimeZone(timeZones, selectedOrganization.timeZone);
      if (orgTimeZone) {
        return orgTimeZone;
      }

      const userTimeZone = forEdit ? getTimeZone(timeZones, user?.timeZone) : undefined;
      if (userTimeZone) {
        return userTimeZone;
      }

      return getUTC(timeZones);
    },
  };
};

/**
 * Get a fallback time zone for a location (based on location org, user, etc.)
 */
export const useLocationTimeZone = () => {
  const timeZones = useTimeZones();
  const defaultTimeZone = useDefaultTimeZone();

  return {
    get: (location?: Location, forEdit?: boolean) => {
      return getTimeZone(timeZones, location?.timeZone) ?? defaultTimeZone.get(forEdit);
    },
  };
};

// TODO - add more utilities as we see fit

export const changeTimezone = (date: Date, timeZone: string) => {
  // suppose the date is 12:00 UTC
  const invdate = new Date(
    date.toLocaleString('en-US', {
      timeZone,
    })
  );

  // then invdate will be 07:00 in Toronto
  // and the diff is 5 hours
  const diff = date.getTime() - invdate.getTime();

  // so 12:00 in Toronto is 17:00 UTC
  return new Date(date.getTime() - diff); // needs to substract
};
