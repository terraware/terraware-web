import { formatNumberScale, formatPrecision } from './numbers';

describe('formatNumberScale', () => {

  test('not a number', () => {
    expect(formatNumberScale('not a number')).toBe('not a number');
    expect(formatNumberScale('')).toBe('');
    expect(formatNumberScale(undefined)).toBe('');
  });

  test('numbers', () => {
    expect(formatNumberScale(12000000)).toBe('12M');
    expect(formatNumberScale(12600000, 1)).toBe('12.6M');
    expect(formatNumberScale(1500)).toBe('2k');
  });

  test('strings', () => {
    expect(formatNumberScale('12600000', 2)).toBe('12.60M');
    expect(formatNumberScale('17', 2)).toBe('17.00');
  });

  test('decimal places', () => {
    expect(formatNumberScale(1500, 1)).toBe('1.5k');
    expect(formatNumberScale(17123234332, 3)).toBe('17.123B');
    expect(formatNumberScale(171232343321128, 1)).toBe('171.2T');
  });

});

describe('formatPrecision', () => {

  test('rounds to the given precision, including a precision of zero', () => {
    expect(formatPrecision(84.7, 0)).toBe('85');
    expect(formatPrecision(84.74, 1)).toBe('84.7');
    expect(formatPrecision(12.345, 2)).toBe('12.35');
  });

  test('explicit precision strips trailing zeros', () => {
    expect(formatPrecision(5, 2)).toBe('5');
    expect(formatPrecision(5.25, 2)).toBe('5.25');
    expect(formatPrecision(5.5, 3)).toBe('5.5');
  });

});
