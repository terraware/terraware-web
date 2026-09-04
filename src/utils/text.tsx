export const numWords = (testString: string): number => {
  return testString.trim().split(/\s+/).length;
};

export const overWordLimit = (testString: string, wordLimit: number): boolean => {
  return numWords(testString) > wordLimit;
};

export const truncate = (s: string, len: number, terminator: string = '...'): string =>
  s.length <= len ? s : s.slice(0, len - terminator.length) + terminator;

/**
 * Finds which of `filenames` sits at the end of `text` -- the "IMG_1.jpg" in "Photo IMG_1.jpg".
 * Whole space-separated segments are compared, so one filename is never matched by the tail of
 * another, and the longest candidate is tried first because a filename may contain spaces itself.
 */
export const findTrailingFilename = (text: string, filenames: string[] | undefined): string | undefined => {
  if (!filenames?.length) {
    return undefined;
  }

  const known = new Set(filenames);
  const words = text.split(' ');

  for (let index = 0; index < words.length; index += 1) {
    const candidate = words.slice(index).join(' ');

    if (known.has(candidate)) {
      return candidate;
    }
  }

  return undefined;
};
