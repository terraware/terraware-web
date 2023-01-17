import LocalizedStrings, { GlobalStrings } from 'react-localization';
import { strings as english } from './strings-en';

// Use the English strings table as the source of truth for the list of keys.
export type ILocalizedStrings = typeof english;

export type ILocalizedStringsMap = GlobalStrings<ILocalizedStrings>;

export const stringsMap = { en: english } as unknown as ILocalizedStringsMap;
const strings = new LocalizedStrings(stringsMap);

export default strings;
