import { SearchType } from 'src/types/Search';

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#escaping
 */
function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Parse the text search term and return the query and the type of search, Fuzzy or PhraseMatch.
 */
const parseSearchTerm = (searchTerm: string): { type: SearchType; values: string[] } => {
  const phraseMatchQuery = removeDoubleQuotes(searchTerm);

  return {
    type: phraseMatchQuery ? 'PhraseMatch' : 'Fuzzy',
    values: [phraseMatchQuery || searchTerm],
  };
};

/**
 * Checks an exact sequence of words or characters within a given string
 */
const phraseMatch = (input: string, word: string): boolean => {
  if (word.length === 0) {
    return false;
  }
  const regex = new RegExp('\\b' + word + '\\b', 'i');
  return !!input.match(regex);
};

/**
 * Check if a string matches a regex pattern
 */
const regexMatch = (input: string, stringToMatch: string): boolean => {
  const regex = new RegExp(escapeRegExp(stringToMatch), 'i');
  return !!input.match(regex);
};

/**
 *   Return inner string if a string is double-quoted, otherwsie null
 */
const removeDoubleQuotes = (str: string): string | null => {
  const pattern = /^"([^"]*)"$/;
  const match = pattern.exec(str);
  if (match) {
    return match[1]; // Return the string inside the double quotes
  } else {
    return null; // Return null if the string is not properly double-quoted
  }
};

export { parseSearchTerm, phraseMatch, regexMatch, removeDoubleQuotes };
