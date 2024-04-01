import { removeDoubleQuotes, phraseMatch } from './search';

describe('removeDoubleQuotes', () => {
    it('should remove double quotes from a string if it is enclosed by double-quotes', () => {
      
      // Empty String
      expect(removeDoubleQuotes('"cat"')).toEqual('cat');

      // Non-double quoted
      expect(removeDoubleQuotes('')).toBeNull();
      expect(removeDoubleQuotes('cat')).toBeNull();

      // Double-quotes not enclosing entire string
      expect(removeDoubleQuotes('cat"meow"')).toBeNull();
      expect(removeDoubleQuotes('"cat"meow')).toBeNull();

      // Non-matching quotes
      expect(removeDoubleQuotes('"cat"meow"')).toBeNull();

      // Two quotes
      expect(removeDoubleQuotes('"cat""meow"')).toBeNull();
    });
  });

describe('phraseMatch', () => {
    it('should return true if the input word/phrase appears in the target string', () => {
      
      // Empty String never matches
      expect(phraseMatch('', '')).toBeFalsy();
      expect(phraseMatch('abc', '')).toBeFalsy();

      // One word
      expect(phraseMatch('apple', 'apple')).toBeTruthy();
      expect(phraseMatch('apple tree', 'apple')).toBeTruthy();
      expect(phraseMatch('green apple', 'apple')).toBeTruthy();
      expect(phraseMatch('applesauce', 'apple')).toBeFalsy();

      // One phrase
      expect(phraseMatch('apple tree', 'apple tree')).toBeTruthy();
      expect(phraseMatch('green apple tree', 'apple tree')).toBeTruthy();
      expect(phraseMatch('apple banana tree', 'apple tree')).toBeFalsy();
      expect(phraseMatch('honeyapple tree', 'apple tree')).toBeFalsy();
      expect(phraseMatch('apple treehouse', 'apple tree')).toBeFalsy();
    });
  });