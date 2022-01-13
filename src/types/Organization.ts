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

export type NewProject = {
  name?: string;
  description?: string;
  startDate?: string;
  status?: string;
  types?: string[];
  organizationId: number;
};

export type Site = {
  id: number;
  name: string;
  description?: string;
  projectId: number;
  facilities?: Facility[];
  latitude?: number;
  longitude?: number;
  projectName?: string;
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
  role: AllOrganizationRoles;
  projects?: Project[];
};

export type HighOrganizationRoles = 'Manager' | 'Admin' | 'Owner';

export type AllOrganizationRoles = HighOrganizationRoles | 'Contributor';

export interface SelectedOrgInfo {
  selectedProject?: Project;
  selectedSite?: Site;
  selectedFacility?: Facility;
}
