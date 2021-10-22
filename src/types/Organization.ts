export type Project = {
  id: number,
  name: string,
};

export type Site = {
  id: number;
  projectId: number;
};

export type SeedBank = {
  id: number;
  siteId: number;
};

export type PlantLayer = {
  id: number;
  siteId: number;
};

export type Organization = {
  projects: Project[],
  sites: Site[],
  facilities: SeedBank[],
  layers: PlantLayer[],
};
