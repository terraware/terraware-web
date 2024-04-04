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

export const getLongDateTime = (date: string, locale: string | undefined | null): string =>
  new Intl.DateTimeFormat(locale || 'en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    hour12: true,
    timeZoneName: 'short',
  }).format(new Date(date));

export const getShortTime = (dateTime: string, locale: string | undefined | null, timeZone?: string): string =>
  new Intl.DateTimeFormat(locale || 'en-US', { timeStyle: 'short', timeZone: timeZone ?? 'UTC' })
    .format(new Date(dateTime))
    .toLowerCase();
