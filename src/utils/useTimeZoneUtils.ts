import { useMemo } from 'react';
import { useOrganization, useTimeZones, useUser } from 'src/providers';
import { SearchResponseElement } from 'src/types/Search';
import { Facility } from 'src/types/Facility';
import { TimeZoneDescription } from 'src/types/TimeZones';

type Location = {
  timeZone?: string;
};

const DEFAULT_UTC = { id: 'Etc/UTC', longName: 'Coordinated Universal Time' };

export const getTimeZone = (timeZones: TimeZoneDescription[], id?: string): TimeZoneDescription | undefined => {
  if (!id) {
    return undefined;
  }
  return timeZones.find((tz) => tz.id === id);
};

/**
 * Populate a search response element with time zone value
 */
export const setTimeZone = (
  element: SearchResponseElement | Facility,
  timeZones: TimeZoneDescription[],
  defaultTimeZone: TimeZoneDescription
) => {
  const { timeZone } = element;
  const tz = getTimeZone(timeZones, timeZone as string) ?? defaultTimeZone;

  return {
    ...element,
    timeZone: tz.longName,
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

  return useMemo(
    () => ({
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
    }),
    [user, selectedOrganization, timeZones]
  );
};

/**
 * Get user time zone (returns undefined if not found)
 */
export const useUserTimeZone = (): TimeZoneDescription | undefined => {
  const { user } = useUser();
  const timeZones = useTimeZones();
  return getTimeZone(timeZones, user?.timeZone);
};

/**
 * Get a fallback time zone for a location (based on location org, user, etc.)
 */
export const useLocationTimeZone = () => {
  const timeZones = useTimeZones();
  const defaultTimeZone = useDefaultTimeZone();

  return useMemo(
    () => ({
      get: (location?: Location, forEdit?: boolean) => {
        return getTimeZone(timeZones, location?.timeZone) ?? defaultTimeZone.get(forEdit);
      },
    }),
    [timeZones, defaultTimeZone]
  );
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
