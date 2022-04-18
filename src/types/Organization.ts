import { Facility } from 'src/api/types/facilities';

export type Project = {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  status?: ProjectStatus;
  types?: ProjectTypes[];
  sites?: Site[];
  totalUsers?: number;
  organizationId: number;
  hidden?: boolean;
};

export type ProjectStatus = 'Propagating' | 'Planting' | 'Completed/Monitoring' | undefined;

export type ProjectTypes = 'Native Forest Restoration' | 'Agroforestry' | 'Silvopasture' | 'Sustainable Timber';

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
  countryCode?: string;
  countrySubdivisionCode?: string;
  description?: string;
  createdTime?: string;
  totalUsers: number;
};

export type HighOrganizationRoles = 'Admin' | 'Owner';

export const HighOrganizationRolesValues = ['Admin', 'Owner'];

// Manager role included here so we don't get type issues with the server response,
// which could contain a user with a manger role.
export type AllOrganizationRoles = HighOrganizationRoles | 'Contributor';

export interface SelectedOrgInfo {
  selectedProject?: Project;
  selectedSite?: Site;
  selectedFacility?: Facility;
}
