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
export const getMonth = (month: number | undefined | null, locale: string | undefined | null): string => {
  if (!month || !locale) {
    return '';
  }

  // avoid generating the key like so
  // return strings[`MONTH_${month.toString().padStart(2, '0')}`];
  // which won't catch missing key issues

  // use an exhaustive switch instead
  switch (month) {
    case 1:
      return strings.MONTH_01;
    case 2:
      return strings.MONTH_02;
    case 3:
      return strings.MONTH_03;
    case 4:
      return strings.MONTH_04;
    case 5:
      return strings.MONTH_05;
    case 6:
      return strings.MONTH_06;
    case 7:
      return strings.MONTH_07;
    case 8:
      return strings.MONTH_08;
    case 9:
      return strings.MONTH_09;
    case 10:
      return strings.MONTH_10;
    case 11:
      return strings.MONTH_11;
    case 12:
      return strings.MONTH_12;
    default:
      return '';
  }
};
