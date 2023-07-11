import { useMemo } from 'react';

const getLocaleToUse = (locale?: string) => (locale === 'gx' ? 'fr' : locale || 'en');

/**
 * formatter
 */
export const useNumberFormatter = (): any => {
  const formatter = (locale?: string, countryCode?: string): any => {
    let localeToUse = getLocaleToUse(locale);
    if (countryCode) {
      localeToUse = `${localeToUse}-${countryCode}`;
    }
    const intlFormat = new Intl.NumberFormat(localeToUse);
    const format = (num: number) => intlFormat.format(num);

    return { format };
  };

  return useMemo(() => formatter, []);
};
