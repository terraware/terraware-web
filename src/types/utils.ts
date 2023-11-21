export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export const isOptionalT = <T>(input: unknown, typeguard: (input: unknown) => input is T): input is T | undefined =>
  input === undefined || typeguard(input);

export const isNumber = (input: unknown): input is number => typeof input === 'number';

export const isOptionalNumber = (input: unknown): input is number | undefined => isOptionalT<number>(input, isNumber);

export const isString = (input: unknown): input is string => typeof input === 'string';

export const isOptionalString = (input: unknown): input is string | undefined => isOptionalT<string>(input, isString);

export const isArray = (input: unknown): input is unknown[] => Array.isArray(input);

export const isArrayOfT = <T>(input: unknown, typeguard: (input: unknown) => input is T): input is T[] =>
  isArray(input) && input.every(typeguard);

export const isObject = (input: unknown): input is Record<string, unknown> =>
  typeof input === 'object' && input !== null && !isArray(input);
