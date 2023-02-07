import { isWhitespaces } from '@terraware/web-components/utils';

/**
 * Removes accents and other diacritics from letters. This is typically used for things like
 * typeaheads where we want a value of "ábc" to match user input of "abc".
 */
export function removeDiacritics(s: string): string {
  // First, decompose characters into combining forms: "á" gets turned into a two-character sequence
  // of "a" followed by a combining character that modifies the previous character to add an accent
  // mark.
  const normalized = s.normalize('NFD');

  // Now remove all the combining characters, resulting in a string without diacritics.
  return normalized.replace(/\p{Mn}/gu, '');
}

export default isWhitespaces;
