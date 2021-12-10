export type Project = {
  id: number;
  name: string;
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
  projects: Project[];
  sites: Site[];
  facilities: SeedBank[];
  plantLayers: PlantLayer[];
};

export type ServerOrganization = {
  id: number;
  name: string;
  role: 'Contributor' | 'Manager' | 'Admin' | 'Owner';
};
