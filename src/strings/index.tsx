import LocalizedStrings, { GlobalStrings } from 'react-localization';
import { strings as english } from './strings-en';

// Use the English strings table as the source of truth for the list of keys.
export type ILocalizedStrings = typeof english;

export type ILocalizedStringsMap = GlobalStrings<ILocalizedStrings>;

// By default, we have no strings to show, but react-localization requires there to be at least
// one locale in the LocalizedStrings constructor's argument. We will dynamically update this when
// we've loaded the strings for the current locale.
const strings = new LocalizedStrings({ _: {} } as unknown as ILocalizedStringsMap);

export default strings;
