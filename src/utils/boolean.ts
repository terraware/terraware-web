import strings from 'src/strings';

/**
 * Returns true if a value is either a boolean true value or a string that equals the word for
 * "true" in the current locale.
 */
export function isTrue(value: unknown): boolean {
  return (typeof value === 'boolean' && value) || value === strings.BOOLEAN_TRUE;
}
