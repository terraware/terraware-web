export type Country = {
  code: number;
  name: string;
  subdivisions: Subdivision[];
};

export type Subdivision = {
  code: number;
  name: string;
};
