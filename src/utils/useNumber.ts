import { useMemo } from 'react';
import { findLocaleDetails, supportedLocales } from 'src/strings/locales';

const getLocaleToUse = (locale?: string) => (locale === 'gx' ? 'fr' : locale || 'en');

/**
 * formatter
 */
export const useNumberFormatter = (): any => {
  const formatter = (locale?: string): any => {
    let localeToUse = getLocaleToUse(locale);
    if (locale && supportedLocales) {
      const localeDetails = findLocaleDetails(supportedLocales, locale);
      localeToUse = localeDetails.id;
    }
    const intlFormat = new Intl.NumberFormat(localeToUse);
    const format = (num: number) => intlFormat.format(num);

    return { format };
  };

  return useMemo(() => formatter, []);
};
