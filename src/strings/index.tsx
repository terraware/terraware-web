import LocalizedStrings, { GlobalStrings } from 'react-localization';

import { LocaleDetails as ComponentLocaleDetails, ComponentStrings } from '@terraware/web-components';

import { strings as english } from './strings-en';

// Use the English strings table as the source of truth for the list of keys this application adds
// on top of the component library's.
type AppStrings = typeof english;

/**
 * Fails the type check if a key is defined in both string tables. The component library's table is
 * the base layer, so redefining one of its keys in csv/en.csv would shadow it at runtime and let
 * the two copies of the translation drift apart; delete the key from csv/en.csv to fix it.
 *
 * The offending keys are wrapped in an object type because TypeScript widens a bare string literal
 * to `string` when reporting an unsatisfied type parameter, which would cost us the one detail
 * worth reporting. `yarn generate-strings` fails on the same collision with a plainer message.
 */
type NoStringsSharedWithComponents<T extends { alreadyDefinedByWebComponents: never }> = T;
export type SharedStringKeys = NoStringsSharedWithComponents<{
  alreadyDefinedByWebComponents: Extract<keyof ComponentStrings, keyof AppStrings>;
}>;

export type ILocalizedStrings = ComponentStrings & AppStrings;

export type ILocalizedStringsMap = GlobalStrings<ILocalizedStrings>;

interface StringsModule {
  /** Only this application's half of the table; the component library supplies the rest. */
  strings: AppStrings;
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
