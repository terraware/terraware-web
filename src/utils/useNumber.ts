import { useMemo } from 'react';

/**
 * See: https://observablehq.com/@mbostock/localized-number-parsing
 */

const getLocaleToUse = (locale?: string) => (locale === 'gx' ? 'fr' : locale || 'en');

export const useNumberParser = (): any => {
  const parser = (locale?: string): any => {
    const localeToUse = getLocaleToUse(locale);
    const parts = new Intl.NumberFormat(localeToUse).formatToParts(12345.6);
    const numerals = new Intl.NumberFormat(localeToUse, { useGrouping: false }).format(9876543210).split('').reverse();
    const index = new Map(numerals.map((d, i) => [d, i]));
    const _group = new RegExp(`[${parts?.find((d) => d?.type === 'group')?.value}]`, 'g');
    const _decimal = new RegExp(`[${parts?.find((d) => d?.type === 'decimal')?.value}]`);
    const _numeral = new RegExp(`[${numerals.join('')}]`, 'g');
    const _index = (d: any) => index.get(d) as unknown as string;

    const parse = (numberStr: string): number | typeof NaN => {
      const str = numberStr.trim().replace(_group, '').replace(_decimal, '.').replace(_numeral, _index);

      return str ? +str : NaN;
    };

    return { parse };
  };

  return useMemo(() => parser, []);
};

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
