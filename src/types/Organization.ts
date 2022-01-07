import { Facility } from 'src/api/types/facilities';

export type Project = {
  id: number;
  name: string;
  sites?: Site[];
};

export type Site = {
  id: number;
  name: string;
  projectId: number;
  facilities?: Facility[];
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

export interface SelectedOrgInfo {
  selectedProject?: Project;
  selectedSite?: Site;
  selectedFacility?: Facility;
}
