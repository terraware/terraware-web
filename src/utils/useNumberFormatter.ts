import { useCallback, useMemo } from 'react';

import { findLocaleDetails, supportedLocales } from 'src/strings/locales';
import { NumberFormatter } from 'src/types/Number';

const getLocaleToUse = (locale?: string) => (locale === 'gx' ? 'fr' : locale || 'en');

/**
 * formatter
 */
export const useNumberFormatter = (locale?: string | null): NumberFormatter => {
  const intlFormat = useMemo(() => {
    let localeToUse = getLocaleToUse(locale ?? undefined);
    if (locale && supportedLocales) {
      const localeDetails = findLocaleDetails(supportedLocales, locale);
      localeToUse = localeDetails.id;
    }
    return new Intl.NumberFormat(localeToUse);
  }, [locale]);
  const format = useCallback((num: number) => intlFormat.format(num), [intlFormat]);

  return useMemo(() => {
    return {
      format,
    };
  }, [format]);
};
