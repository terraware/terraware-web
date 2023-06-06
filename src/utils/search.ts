/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#escaping
 */
function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Check if a string matches a regex pattern
 */
export const regexMatch = (input: string, stringToMatch: string): boolean => {
  const regex = new RegExp(escapeRegExp(stringToMatch), 'i');
  return !!input.match(regex);
};
