import LocalizedStrings, { GlobalStrings } from 'react-localization';

import { LocaleDetails as ComponentLocaleDetails } from '@terraware/web-components';

import { strings as english } from './strings-en';

// Use the English strings table as the source of truth for the list of keys.
export type ILocalizedStrings = typeof english;

export type ILocalizedStringsMap = GlobalStrings<ILocalizedStrings>;

interface StringsModule {
  strings: ILocalizedStrings;
}

export interface LocaleDetails extends ComponentLocaleDetails {
  /**
   * Dynamic import of the strings module for the locale. This must be an import of a constant
   * module name (as opposed to a function that constructs the module name on the fly) so that
   * the bundler knows to split the strings modules out into separate downloadable artifacts.
   */
  loadModule: () => Promise<StringsModule>;
}

// By default, we have no strings to show, but react-localization requires there to be at least
// one locale in the LocalizedStrings constructor's argument. We will dynamically update this when
// we've loaded the strings for the current locale.
const strings = new LocalizedStrings({ _: {} } as unknown as ILocalizedStringsMap);

export default strings;
