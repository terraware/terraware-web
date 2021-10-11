export type Project = {
  id: number,
  name: string,
};

export type Site = {
  id: number;
  projectId: number;
};

export type Facility = {
  id: number;
  siteId: number;
  type: string;
};

export type Layer = {
  id: number;
  siteId: number;
  layerType: string;
};

export type Organization = {
  projects: Project[],
  sites: Site[],
  facilities: Facility[],
  layers: Layer[],
};
