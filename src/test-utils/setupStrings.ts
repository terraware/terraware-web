import { getStrings as getComponentStrings, setLocale as setComponentLocale } from '@terraware/web-components';

import defaultStrings, { ILocalizedStringsMap } from 'src/strings';
import { strings as english } from 'src/strings/strings-en';

/**
 * Load the English string table before any test runs.
 *
 * `src/strings` exports an empty `LocalizedStrings` instance; the app fills it in at runtime when
 * `LocalizationProvider` resolves the locale module. Without this, every `strings.SOMETHING`
 * reference in a component is `undefined` at test time, components render blank text, and
 * assertions fail in ways that look like the component is broken rather than the harness.
 *
 * This mirrors what `LocalizationProvider` does, minus the async module load, so tests can assert
 * on real user-facing copy via `strings.SOME_KEY` instead of hardcoded literals that drift.
 */
const localeMap = {
  en: { ...getComponentStrings(), ...english },
} as unknown as ILocalizedStringsMap;

defaultStrings.setContent(localeMap);
defaultStrings.setLanguage('en');
setComponentLocale('en');
