/**
 * Email address matching pattern equivalent to the validation logic of HTML5 email input elements.
 *
 * https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
 */
const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Returns true if a string looks like a valid email address. This uses the same pattern-based
 * approach that browsers use in "email" input elements; like the browser's built-in validation, it
 * does not check whether the address actually exists, and can fail on some kinds of non-ASCII email
 * addresses.
 */
export function isEmailAddress(value: string) {
  return emailRegex.test(value);
}
