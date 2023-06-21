import { useMemo } from 'react';
import { LocaleDetails } from '.';
import useEnvironment from 'src/utils/useEnvironment';

/** Supported locales in the order they should appear in the locale selector. */
const supportedLocales: LocaleDetails[] = [
  { id: 'en', name: 'English', loadModule: () => import('./strings-en') },
  { id: 'es', name: 'Español', loadModule: () => import('./strings-es') },
  { id: 'gx', name: 'Gibberish', loadModule: () => import('./strings-gx'), inDevelopment: true },
];

const supportedLocaleIds = supportedLocales.map((locale: LocaleDetails) => locale.id);

export type SupportedLocaleId = typeof supportedLocaleIds[number];

export const useSupportedLocales = (): LocaleDetails[] => {
  const { isProduction } = useEnvironment();

  // this can be extended for languages in development
  return useMemo(
    () => (isProduction ? supportedLocales.filter((locale) => !locale.inDevelopment) : supportedLocales),
    [isProduction]
  );
};
