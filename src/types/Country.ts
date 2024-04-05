export type Country = {
  code: string;
  name: string;
  region?: string;
  subdivisions?: Subdivision[];
};

export type Subdivision = {
  code: string;
  name: string;
};
