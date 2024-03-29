import { useEffect, useState } from 'react';

export default function useDebounce<T>(value: T, delay: number, callback?: (v: T) => void) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    // Update debounced value after delay, execute callback if defined
    const handler = setTimeout(() => {
      if (value !== debouncedValue) {
        setDebouncedValue(value);
        if (callback) {
          callback(value);
        }
      }
    }, delay);
    // Cancel the timeout if value changes (also on delay change or unmount)
    // This is how we prevent debounced value from updating if value is changed ...
    // .. within the delay period. Timeout gets cleared and restarted.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, callback, debouncedValue]);
  return debouncedValue;
}
