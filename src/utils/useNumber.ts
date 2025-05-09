import { useMemo } from 'react';

import { findLocaleDetails, supportedLocales } from 'src/strings/locales';

const getLocaleToUse = (locale?: string) => (locale === 'gx' ? 'fr' : locale || 'en');

type NumberFormatter = (locale?: string | null) => {
  format: (num: number) => string;
};

/**
 * formatter
 */
export const useNumberFormatter = (): NumberFormatter => {
  const formatter = (locale?: string | null): { format: (num: number) => string } => {
    let localeToUse = getLocaleToUse(locale ?? undefined);
    if (locale && supportedLocales) {
      const localeDetails = findLocaleDetails(supportedLocales, locale);
      localeToUse = localeDetails.id;
    }
    const intlFormat = new Intl.NumberFormat(localeToUse);
    const format = (num: number) => intlFormat.format(num);

    return { format };
  };

  return useMemo(() => formatter, [formatter]);
};
