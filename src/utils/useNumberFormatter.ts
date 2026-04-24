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

  const localeToUse = useMemo(() => {
    let locale = getLocaleToUse(activeLocale ?? undefined);
    if (activeLocale && supportedLocales) {
      const localeDetails = findLocaleDetails(supportedLocales, activeLocale);
      locale = localeDetails.id;
    }
    return locale;
  }, [activeLocale]);

  const intlFormat = useMemo(() => new Intl.NumberFormat(localeToUse), [localeToUse]);

  const format = useCallback(
    (num?: number, options?: { decimals?: number }) => {
      if (typeof num === 'undefined') {
        return '';
      }
      if (options?.decimals !== undefined) {
        return new Intl.NumberFormat(localeToUse, {
          minimumFractionDigits: options.decimals,
          maximumFractionDigits: options.decimals,
        }).format(num);
      }
      return intlFormat.format(num);
    },
    [intlFormat, localeToUse]
  );

  return useMemo(() => {
    return {
      format,
    };
  }, [format]);
};
