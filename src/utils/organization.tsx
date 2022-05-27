import { Facility } from 'src/api/types/facilities';
import { HighOrganizationRolesValues, Project, ServerOrganization, Site } from 'src/types/Organization';

export const getAllSites = (organization: ServerOrganization): Site[] => {
  const sites: Site[] = [];
  organization.projects?.forEach((project) => {
    project.sites?.forEach((site) => {
      if (site.name !== 'Seed Bank') {
        sites.push(site);
      }
    });
  });
  return sites;
};

const getAllSitesForProject = (project: Project): Site[] => {
  return project.sites ? project.sites : [];
};

export const getSelectedSites = (
  selectedSite: Site | undefined,
  selectedProject: Project | undefined,
  organization: ServerOrganization
): Site[] => {
  let sites: Site[] = [];
  if (selectedSite) {
    sites.push(selectedSite);
  } else if (selectedProject) {
    sites = getAllSitesForProject(selectedProject);
  } else {
    sites = getAllSites(organization);
  }
  return sites;
};

export type ProjectsById = Map<number, Project>;

export const getProjectsById = (organization: ServerOrganization): ProjectsById => {
  const projectById = new Map();
  getOrganizationProjects(organization)?.forEach((project) => {
    projectById.set(project.id, project);
  });
  return projectById;
};

export type SitesById = Map<number, Site>;

export const getSitesById = (organization: ServerOrganization): SitesById => {
  const sitesById = new Map();
  const sites = getAllSitesWithProjectName(organization);
  sites.forEach((site) => {
    sitesById.set(site.id, site);
  });
  return sitesById;
};

export const getAllSitesWithProjectName = (organization: ServerOrganization): Site[] => {
  const projectsById = getProjectsById(organization);
  const newSites = getAllSites(organization).map((site) => {
    return {
      ...site,
      projectName: projectsById.get(site.projectId)?.name || '',
    };
  });
  return newSites;
};

export const getAllSeedBanks = (organization: ServerOrganization): (Facility | undefined)[] => {
  let seedBanks: (Facility | undefined)[] = [];
  if (organization && organization.projects) {
    seedBanks = organization?.projects?.flatMap((project) =>
      project.sites?.flatMap((site) => site.facilities?.filter((facility) => facility.type === 'Seed Bank'))
    );
  }
  return seedBanks;
};

export const getSeedBankSite = (organization: ServerOrganization): Site | undefined => {
  let seedBankSite;
  if (organization && organization.projects) {
    organization.projects.forEach((proj) => {
      proj.sites?.forEach((site) => {
        if (site.name === 'Seed Bank') {
          seedBankSite = site;
        }
      });
    });
  }
  return seedBankSite;
};

export const getFirstProject = (organization: ServerOrganization | undefined): Project | null => {
  if (organization?.projects && organization.projects[0]) {
    return organization.projects[0];
  }
  return null;
};

export const getFirstSite = (organization: ServerOrganization | undefined): Site | null => {
  if (
    organization?.projects &&
    organization.projects[0] &&
    organization.projects[0].sites &&
    organization.projects[0].sites[0]
  ) {
    return organization.projects[0].sites[0];
  }
  return null;
};

export const getFirstFacility = (organization: ServerOrganization | undefined): Facility | null => {
  if (
    organization?.projects &&
    organization.projects[0] &&
    organization.projects[0].sites &&
    organization.projects[0].sites[0] &&
    organization.projects[0].sites[0].facilities &&
    organization.projects[0].sites[0].facilities[0]
  ) {
    return organization.projects[0].sites[0].facilities[0];
  }
  return null;
};

export const getOrganizationProjects = (organization: ServerOrganization | undefined) => {
  return organization?.projects?.filter((proj) => proj.name !== 'Seed Bank') || [];
};

export const isAdmin = (organization: ServerOrganization | undefined) => {
  return HighOrganizationRolesValues.includes(organization?.role || '');
};
