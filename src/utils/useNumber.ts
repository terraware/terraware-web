import { useMemo } from 'react';
import { useLocalization } from 'src/providers';
import { LocaleDetails } from 'src/strings';
import { findLocaleDetails } from 'src/strings/locales';

const getLocaleToUse = (locale?: string) => (locale === 'gx' ? 'fr' : locale || 'en');

/**
 * formatter
 */
export const useNumberFormatter = (): any => {
  const formatter = (locale?: string, supportedLocales?: LocaleDetails[]): any => {
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

/**
 * Parser
 * ref: https://observablehq.com/@mbostock/localized-number-parsing
 */
export const useNumberParser = (): any => {
  const locale = useLocalization().activeLocale ?? 'en-US';

  const parser = useMemo(() => {
    const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
    const numerals = new Intl.NumberFormat(locale, { useGrouping: false }).format(9876543210).split('').reverse();
    const ind = new Map(numerals.map((d, i) => [d, i]));
    const group = new RegExp(`[${parts.find((d) => d.type === 'group')?.value}]`, 'g');
    const decimal = new RegExp(`[${parts.find((d) => d.type === 'decimal')?.value}]`);
    const numeral = new RegExp(`[${numerals.join('')}]`, 'g');
    const index = (d: string) => `${ind.get(d)}`;

    return { group, decimal, numeral, index };
  }, [locale]);

  return useMemo(
    () => (str: string) => {
      const convertedString = str
        .trim()
        .replace(parser.group, '')
        .replace(parser.decimal, '.')
        .replace(parser.numeral, parser.index);
      return convertedString ? +convertedString : NaN;
    },
    [parser]
  );
};
