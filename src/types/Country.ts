export type Country = {
  canonicalName: string;
  code: string;
  name: string;
  region?: string;
  subdivisions?: Subdivision[];
};

export type Subdivision = {
  code: string;
  name: string;
};
