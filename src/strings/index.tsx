import LocalizedStrings, { GlobalStrings } from 'react-localization';
import { strings as english } from './strings-en';

// Use the English strings table as the source of truth for the list of keys.
export type ILocalizedStrings = typeof english;

export type ILocalizedStringsMap = GlobalStrings<ILocalizedStrings>;

interface StringsModule {
  strings: ILocalizedStrings;
}

export interface LocaleDetails {
  /**
   * Locale identifier. This must start with a language tag (2 or 3 letters) and may optionally
   * have a hyphen and a location code. For example, 'en' or 'en-US'.
   */
  id: string;
  /**
   * Name of the locale as it appears in the locale selector dropdown. This will typically be the
   * name of the locale in whatever language the locale uses. That is, 'Español' and not 'Spanish'.
   */
  name: string;
  /**
   * Dynamic import of the strings module for the locale. This must be an import of a constant
   * module name (as opposed to a function that constructs the module name on the fly) so that
   * Webpack knows to split the strings modules out into separate downloadable artifacts.
   */
  loadModule: () => Promise<StringsModule>;
  /**
   * Whether this locale is in development and not ready for production.
   */
  inDevelopment?: boolean;
}

// By default, we have no strings to show, but react-localization requires there to be at least
// one locale in the LocalizedStrings constructor's argument. We will dynamically update this when
// we've loaded the strings for the current locale.
const strings = new LocalizedStrings({ _: {} } as unknown as ILocalizedStringsMap);

export default strings;
