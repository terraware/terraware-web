import { strings as english } from './strings-en';
import { ILocalizedStrings } from './index';

/** Override the default gibberish strings in specific cases. */
const overrides = {
  MONITORING_DATE_FORMAT: 'kk:mm d Mo',
};

/**
 * Transforms the English strings table into gibberish.
 *
 * 1. Split the English string into whitespace-delimited words.
 * 2. Reverse the order of the words.
 * 3. Render each word as a base64 encoding of its UTF-8 representation, except for words that look
 *    like format string placeholders.
 */
function generateGibberish(): ILocalizedStrings {
  const encoder = new TextEncoder();
  const gibberish = Object.assign({}, english);
  Object.keys(english).forEach((key) => {
    const englishString = english[key as keyof ILocalizedStrings];
    const words = englishString.split(' ').reverse();
    const encodedWords = words.map((word: string) => {
      if (word.startsWith('{')) {
        return word;
      } else {
        const uint8Array = encoder.encode(word);
        const binary = Array(uint8Array.length)
          .fill('')
          .map((_, i) => String.fromCharCode(uint8Array[i]))
          .join('');
        return btoa(binary).replace(/=/g, '');
      }
    });
    gibberish[key as keyof ILocalizedStrings] = encodedWords.join(' ');
  });

  return { ...gibberish, ...overrides };
}

export const strings = generateGibberish();
