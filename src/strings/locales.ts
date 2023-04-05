import { LocaleDetails } from '.';

/** Supported locales in the order they should appear in the locale selector. */
export const supportedLocales: LocaleDetails[] = [
  { id: 'en', name: 'English', loadModule: () => import('./strings-en') },
  { id: 'es', name: 'Español', loadModule: () => import('./strings-es') },
  { id: 'gx', name: 'Gibberish', loadModule: () => import('./strings-gx') },
];
