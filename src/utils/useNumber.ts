import { useMemo } from 'react';

const getLocaleToUse = (locale?: string) => (locale === 'gx' ? 'fr' : locale || 'en');

/**
 * formatter
 */
export const useNumberFormatter = (): any => {
  const formatter = (locale?: string): any => {
    const localeToUse = getLocaleToUse(locale);
    const intlFormat = new Intl.NumberFormat(localeToUse);
    const format = (num: number) => intlFormat.format(num);

    return { format };
  };

  return useMemo(() => formatter, []);
};
