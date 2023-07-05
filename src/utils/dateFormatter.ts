import strings from 'src/strings';

/**
 * Returns <Month> <Year> (eg. July 2023) from yyyy-mm-dd format
 */
export const getShortDate = (date: string, locale: string | undefined | null): string =>
  new Intl.DateTimeFormat(locale || 'en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(date)
  );

export const getLongDate = (date: string, locale: string | undefined | null): string =>
  new Intl.DateTimeFormat(locale || 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));

export const getShortTime = (dateTime: string, locale: string | undefined | null, timeZone?: string): string =>
  new Intl.DateTimeFormat(locale || 'en-US', { timeStyle: 'short', timeZone: timeZone ?? 'UTC' })
    .format(new Date(dateTime))
    .toLowerCase();

// return string version for a month from number, eg. 1 -> January
export const getMonth = (month?: number): string => {
  const monthNumber = month?.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });

  const stringsMap = strings as any;
  return stringsMap[`MONTH_${monthNumber}`] ?? '';
};
