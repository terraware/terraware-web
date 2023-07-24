import { useMemo } from 'react';
import { LocaleDetails } from '.';
import useEnvironment from 'src/utils/useEnvironment';

/** Supported locales in the order they should appear in the locale selector. */
export const supportedLocales: LocaleDetails[] = [
  { id: 'en', name: 'English', loadModule: () => import('./strings-en') },
  { id: 'es', name: 'Español', loadModule: () => import('./strings-es') },
  { id: 'gx', name: 'Gibberish', loadModule: () => import('./strings-gx'), inDevelopment: true },
];

const supportedLocaleIds = supportedLocales.map((locale: LocaleDetails) => locale.id);

export type SupportedLocaleId = (typeof supportedLocaleIds)[number];

export const useSupportedLocales = (): LocaleDetails[] => {
  const { isProduction } = useEnvironment();

  // this can be extended for languages in development
  return useMemo(
    () => (isProduction ? supportedLocales.filter((locale) => !locale.inDevelopment) : supportedLocales),
    [isProduction]
  );
};

/**
 * Returns the locale from the list of supported locales that matches the user's selected langauge.
 *
 * The user's locale can include both a language and a country code, but entries in the menu of
 * languages usually don't have country codes. So we need to find the entry that is the longest
 * prefix of the user's locale.
 *
 * If the locale is es-MX and the list of locales only has es, we want the es item to be selected
 * in the dropdown. But if the locale is zh-CN and the list of locales has both zh-CN and zh-TW,
 * we want zh-CN to be selected.
 *
 * If none of the locales in the list matches, returns the first locale from the list.
 */
export function findLocaleDetails(locales: LocaleDetails[], locale: string): LocaleDetails {
  return locales.reduce((bestMatch, candidate) => {
    if (
      locale.startsWith(candidate.id) &&
      (!bestMatch.id.startsWith(locale) || candidate.id.length > bestMatch.id.length)
    ) {
      return candidate;
    } else {
      return bestMatch;
    }
  });
}
