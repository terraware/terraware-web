export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export const isNumber = (input: unknown): input is number => typeof input === 'number';

export const isArray = (input: unknown): input is unknown[] => Array.isArray(input);

export const isArrayOfT = <T>(input: unknown, typeguard: (input: unknown) => input is T): input is T[] =>
  isArray(input) && input.every(typeguard);

// Gives you a type from an array of the given type
// (1 | 2 | 3)[] => 1 | 2 | 3
// MyType[] => MyType
export type ArrayDeref<T extends unknown[]> = T[number];

// Removes the union with undefined
// MyType | undefined => MyType
export type NonUndefined<T> = T extends undefined ? never : T;
