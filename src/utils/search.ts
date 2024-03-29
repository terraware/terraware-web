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

/**
 * Checks an exact sequence of words or characters within a given string
 */
export const phraseMatch = (input: string, word: string): boolean => {
  const regex = new RegExp("\\b" + word + "\\b", "i");
  return !!input.match(regex)
}

/**
 *   Return inner string if a string is double-quoted, otherwsie null
 */
export const removeDoubleQuotes = (str: string): string | null => {
  const pattern = /^"([^"]*)"$/;
  const match = pattern.exec(str);
  if (match) {
    return match[1]; // Return the string inside the double quotes
  } else {
    return null; // Return null if the string is not properly double-quoted
  }
};
