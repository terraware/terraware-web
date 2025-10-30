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

export const allowOneDecimal = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const input = e.currentTarget.querySelector('input');
  if (!input) {
    return;
  }
  const value = input.value;
  const key = e.key;

  // Allow control keys
  if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(key)) {
    return;
  }

  // If decimal separator is entered
  if (key === '.' || key === ',') {
    // Prevent if already has a decimal separator
    if (value.includes('.') || value.includes(',')) {
      e.preventDefault();
    }
    return;
  }

  // If a digit is entered
  if (/^\d$/.test(key)) {
    const decimalIndex = Math.max(value.indexOf('.'), value.indexOf(','));
    // If there's a decimal separator and already has one decimal digit
    if (decimalIndex !== -1) {
      const decimalsAfter = value.slice(decimalIndex + 1).length;

      // If there's already one or more decimal digits
      if (decimalsAfter >= 1) {
        const selectionStart = input.selectionStart || 0;
        const selectionEnd = input.selectionEnd || 0;
        const hasSelection = selectionStart !== selectionEnd;

        // Only allow if replacing selected text or editing before decimal point
        if (!hasSelection && selectionStart > decimalIndex) {
          e.preventDefault();
        }
      }
    }
  }
};
