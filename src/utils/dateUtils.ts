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
