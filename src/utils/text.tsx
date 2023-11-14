import { isWhitespaces } from '@terraware/web-components/utils';

export const numWords = (testString: string): number => {
  return testString.trim().split(/\s+/).length;
};

export const overWordLimit = (testString: string, wordLimit: number): boolean => {
  return numWords(testString) > wordLimit;
};

export const truncate = (s: string, len: number, terminator: string = '...'): string =>
  s.length <= len ? s : s.slice(0, len - terminator.length) + terminator;

export default isWhitespaces;
