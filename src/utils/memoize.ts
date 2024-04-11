import lodashMemoize from 'lodash/memoize';

// This lodash memoize wrapper works with any number of args all the time
// Out of the box it only uses the first arg as the cache key
type AnyFunc<T> = (...args: any[]) => T;

export const memoize = <T>(func: AnyFunc<T>): AnyFunc<T> => lodashMemoize(func, (...args) => JSON.stringify(args));
