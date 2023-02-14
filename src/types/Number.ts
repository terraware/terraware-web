export type NumericParser = {
  parse: (str: string) => number | typeof NaN;
};

export type NumericFormatter = {
  format: (num: number) => string;
};
