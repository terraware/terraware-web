import { useMemo } from 'react';

import {
  LocaleDetails as ComponentLocaleDetails,
  findLocaleDetails as findComponentLocaleDetails,
} from '@terraware/web-components';

import useEnvironment from 'src/utils/useEnvironment';

import { LocaleDetails } from '.';

/** Supported locales in the order they should appear in the locale selector. */
export const supportedLocales: LocaleDetails[] = [
  { id: 'en', name: 'English', loadModule: () => import('./strings-en') },
  { id: 'es', name: 'Español', loadModule: () => import('./strings-es') },
  { id: 'fr', name: 'Français', loadModule: () => import('./strings-fr') },
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
 * Returns the locale from the list of supported locales that matches the user's selected language.
 *
 * Adds the caller's element type. web-components' signature isn't generic, so it returns a bare LocaleDetails, which
 * does not have `loadModule`.
 */
export const findLocaleDetails = <T extends ComponentLocaleDetails>(locales: T[], locale: string): T =>
  findComponentLocaleDetails(locales, locale) as T;
