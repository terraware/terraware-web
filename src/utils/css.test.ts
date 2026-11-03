import { cssSize } from './css';

describe('cssSize', () => {
  it.each([
    ['an integer number', 100, '100px'],
    ['a numeric string', '100', '100px'],
    ['zero', 0, '0px'],
    ['a negative number', -10, '-10px'],
  ])('adds px to %s', (_description, value, expected) => {
    expect(cssSize(value)).toBe(expected);
  });

  // MUI's sizing props read a bare number below 1 as a fraction of the parent, so `0.75` would come
  // out as 75% instead of three quarters of a pixel unless the unit is added here.
  it('adds px to a decimal rather than leaving it to be read as a fraction of the parent', () => {
    expect(cssSize(0.75)).toBe('0.75px');
    expect(cssSize('0.75')).toBe('0.75px');
  });

  it.each([
    ['px', '100px'],
    ['%', '50%'],
    ['rem', '1.5rem'],
    ['a keyword', 'auto'],
    ['a calc() expression', 'calc(100% - 10px)'],
  ])('leaves a value given in %s unchanged', (_description, value) => {
    expect(cssSize(value)).toBe(value);
  });

  it('returns undefined when no size is given', () => {
    expect(cssSize(undefined)).toBeUndefined();
    expect(cssSize()).toBeUndefined();
  });
});
