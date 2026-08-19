import { afterEach } from '@rstest/core';
import { getStrings as getComponentStrings, setLocale as setComponentLocale } from '@terraware/web-components';

import defaultStrings, { ILocalizedStringsMap } from 'src/strings';
import { strings as english } from 'src/strings/strings-en';
import { strings as spanish } from 'src/strings/strings-es';
import { strings as french } from 'src/strings/strings-fr';
import { strings as gibberish } from 'src/strings/strings-gx';

/**
 * Load the string tables before any test runs.
 *
 * `src/strings` exports an empty `LocalizedStrings` instance; the app fills it in at runtime when
 * `LocalizationProvider` resolves the locale module. Without this, every `strings.SOMETHING`
 * reference in a component is `undefined` at test time, components render blank text, and
 * assertions fail in ways that look like the component is broken rather than the harness.
 *
 * All supported locales are loaded rather than just English, so that a test overriding the locale
 * gets translated copy instead of a mixed state where the context claims French and the strings are
 * still English. `renderWithProviders` switches the active language when given a locale override;
 * the `afterEach` below puts it back.
 */
const APP_STRINGS: Record<string, object> = {
  en: english,
  es: spanish,
  fr: french,
  gx: gibberish,
};

export const DEFAULT_TEST_LOCALE = 'en';

/**
 * Point the string tables at a locale, the same way `LocalizationProvider` does: the component
 * library's locale is switched first so its table is read in the right language, then this
 * application's strings are laid over it.
 */
export const setTestLocale = (locale: string) => {
  const localeId = locale in APP_STRINGS ? locale : DEFAULT_TEST_LOCALE;

  setComponentLocale(localeId);

  defaultStrings.setContent({
    [localeId]: { ...getComponentStrings(), ...APP_STRINGS[localeId] },
  } as unknown as ILocalizedStringsMap);
  defaultStrings.setLanguage(localeId);
};

setTestLocale(DEFAULT_TEST_LOCALE);

// The string table is a module-level singleton, so a test that switches locale would otherwise
// leak that choice into every test that runs after it.
afterEach(() => {
  setTestLocale(DEFAULT_TEST_LOCALE);
});
