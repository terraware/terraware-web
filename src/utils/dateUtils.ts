import { DateTime } from 'luxon';

/**
 * Checks if a date (dateString1) occurs after another date (dateString2).
 * Returns true if dateString1 occurs after dateString2.
 * If any date is undefined, the valid date takes precedence.
 * If both are undefined, returns undefined.
 */
export const isAfter = (dateString1: string | undefined, dateString2: string | undefined): boolean | undefined => {
  if (dateString1 !== undefined && dateString2 !== undefined) {
    const date1 = new Date(dateString1).getTime();
    const date2 = new Date(dateString2).getTime();

    return date1 > date2;
  }

  if (dateString1 === undefined && dateString2 !== undefined) {
    return false;
  }

  if (dateString1 !== undefined && dateString2 === undefined) {
    return true;
  }

  return undefined;
};

export const today = DateTime.now().toUTC().startOf('day');

export const getQuarter = (date: Date): number => {
  const month = date.getMonth();

  if (month >= 1 && month <= 3) {
    return 1;
  }

  if (month >= 4 && month <= 6) {
    return 2;
  }

  if (month >= 7 && month <= 9) {
    return 3;
  }

  if (month >= 10 && month <= 12) {
    return 4;
  }

  return -1;
};
