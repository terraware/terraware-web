import { useMemo } from 'react';
import { LocaleDetails } from 'src/strings';
import { findLocaleDetails, supportedLocales } from 'src/strings/locales';

const getLocaleToUse = (locale?: string) => (locale === 'gx' ? 'fr' : locale || 'en');

/**
 * formatter
 */
export const useNumberFormatter = (): any => {
  const formatter = (locale?: string, supportedLocalesParam?: LocaleDetails[]): any => {
    const locales = supportedLocalesParam || supportedLocales;
    let localeToUse = getLocaleToUse(locale);
    if (locale && locales) {
      const localeDetails = findLocaleDetails(locales, locale);
      localeToUse = localeDetails.id;
    }
    const intlFormat = new Intl.NumberFormat(localeToUse);
    const format = (num: number) => intlFormat.format(num);

    return { format };
  };

  return useMemo(() => formatter, []);
};
