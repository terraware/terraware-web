import { Facility } from 'src/api/types/facilities';

export type Project = {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  status?: string;
  types?: string[];
  sites?: Site[];
};

export type Site = {
  id: number;
  name: string;
  description?: string;
  projectId: number;
  facilities?: Facility[];
  latitude?: number;
  longitude?: number;
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
  projects?: Project[];
};
