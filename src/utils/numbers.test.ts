import { formatNumberScale } from './numbers';

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
