/**
 * Formats a number with scale suffixes (k, M, B, T)
 * @param value - The number or string to format
 * @param decimalPlaces - Optional number of decimal places (default: 0)
 * @returns Formatted string with the appropriate suffix or original value if not a number
 */
export const formatNumberScale = (value?: number | string, decimalPlaces: number = 0): string => {
  if (value === undefined) {
    return '';
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return String(value);
  }

  const scales = [
    { threshold: 1e12, suffix: 'T' }, // Trillion
    { threshold: 1e9, suffix: 'B' }, // Billion
    { threshold: 1e6, suffix: 'M' }, // Million
    { threshold: 1e3, suffix: 'k' }, // Thousand
    { threshold: 1, suffix: '' }, // No suffix
  ];

  const scale = scales.find((_scale) => Math.abs(num) >= _scale.threshold);
  if (!scale) {
    return num.toFixed(decimalPlaces);
  }

  const scaledNum = num / scale.threshold;
  return `${scaledNum.toFixed(decimalPlaces)}${scale.suffix}`;
};

export const disableDecimalChar = (e: React.KeyboardEvent<HTMLDivElement>) => {
  if (e.key === '.' || e.key === ',') {
    e.preventDefault();
  }
};
