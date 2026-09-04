import { findTrailingFilename } from './text';

describe('findTrailingFilename', () => {
  it('finds the filename at the end of the text', () => {
    expect(findTrailingFilename('Photo IMG_1.jpg', ['IMG_1.jpg'])).toBe('IMG_1.jpg');
  });

  it('does not match a filename that is only the tail of the trailing filename', () => {
    expect(findTrailingFilename('Photo myIMG.jpg', ['IMG.jpg', 'myIMG.jpg'])).toBe('myIMG.jpg');
  });

  it('matches the shorter filename when it is the whole trailing segment', () => {
    expect(findTrailingFilename('Photo IMG.jpg', ['IMG.jpg', 'myIMG.jpg'])).toBe('IMG.jpg');
  });

  it('matches a filename containing spaces', () => {
    expect(findTrailingFilename('Photo my photo (1).jpg', ['my photo (1).jpg'])).toBe('my photo (1).jpg');
  });

  it('prefers the longest filename when several align on a space boundary', () => {
    expect(findTrailingFilename('Photo my photo (1).jpg', ['photo (1).jpg', 'my photo (1).jpg'])).toBe(
      'my photo (1).jpg'
    );
  });

  it('returns undefined when no filename matches', () => {
    expect(findTrailingFilename('Photo IMG_1.jpg', ['IMG_2.jpg'])).toBeUndefined();
  });

  it('returns undefined when the filenames are undefined', () => {
    expect(findTrailingFilename('Photo IMG_1.jpg', undefined)).toBeUndefined();
  });

  it('returns undefined when the filenames are empty', () => {
    expect(findTrailingFilename('Photo IMG_1.jpg', [])).toBeUndefined();
  });
});
