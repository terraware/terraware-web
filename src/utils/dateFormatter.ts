import { getDateDisplayValue } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

/**
 * Returns <Month> <Year> (eg. July 2023) from yyyy-mm-dd format
 */
export const getShortDate = (date: string, locale: string | undefined | null): string =>
  new Intl.DateTimeFormat(locale || 'en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(date)
  );

/**
 * Returns <Month> <Day>, <Year> (eg. July 1, 2023)
 */
export const getLongDate = (date: string, locale: string | undefined | null): string =>
  new Intl.DateTimeFormat(locale || 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));

/**
 * Returns <Month> <Day>, <Year> at <Hour>:<Minute>:<Second> <AM/PM> (eg. July 1, 2023 at 2:00:00 PM)
 */
export const getLongDateTime = (date: string, locale: string | undefined | null): string =>
  new Intl.DateTimeFormat(locale || 'en-US', {
    dateStyle: 'long',
    timeStyle: 'medium',
  }).format(new Date(date));

/**
 * Returns <Hour>:<Minute> <am/pm> (eg. 12:00 pm)
 */
export const getShortTime = (dateTime: string, locale: string | undefined | null, timeZone?: string): string =>
  new Intl.DateTimeFormat(locale || 'en-US', { timeStyle: 'short', timeZone: timeZone ?? 'UTC' })
    .format(new Date(dateTime))
    .toLowerCase();

/**
 * Returns <ISO Date> <Hour>:<Minute> <AM/PM> (eg. 2023-09-05 3:31 PM)
 */
export const getDateTimeDisplayValue = (timestamp: number): string => {
  const dateTime = DateTime.fromMillis(timestamp);
  // DateTime has pre-supported formats but none satisfy our requirements
  return `${getDateDisplayValue(timestamp)} ${dateTime.toLocaleString(DateTime.TIME_SIMPLE)}`;
};

/**
 * Returns <ISO Date> – <ISO Date> (eg. 2023/07/01 - 2023/07/15)
 */
export const getDateRangeString = (startDate: string, endDate: string) => {
  const formattedStart = DateTime.fromISO(startDate).toFormat('yyyy/MM/dd');
  const formattedEnd = DateTime.fromISO(endDate).toFormat('yyyy/MM/dd');

  return `${formattedStart} – ${formattedEnd}`;
};
