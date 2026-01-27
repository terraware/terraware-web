import { useCallback, useMemo } from 'react';

import { findLocaleDetails, supportedLocales } from 'src/strings/locales';
import { NumberFormatter } from 'src/types/Number';

import { useLocalization } from '../providers';

const getLocaleToUse = (locale?: string) => (locale === 'gx' ? 'fr' : locale || 'en');

/**
 * formatter
 */
export const useNumberFormatter = (): NumberFormatter => {
  const { activeLocale } = useLocalization();

  const intlFormat = useMemo(() => {
    let localeToUse = getLocaleToUse(activeLocale ?? undefined);
    if (activeLocale && supportedLocales) {
      const localeDetails = findLocaleDetails(supportedLocales, activeLocale);
      localeToUse = localeDetails.id;
    }
    return new Intl.NumberFormat(localeToUse);
  }, [activeLocale]);

  const format = useCallback((num: number) => intlFormat.format(num), [intlFormat]);

  return useMemo(() => {
    return {
      format,
    };
  }, [format]);
};
