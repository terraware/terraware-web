import { Project, ServerOrganization, Site } from 'src/types/Organization';

export const getAllSites = (organization: ServerOrganization): Site[] => {
  const sites: Site[] = [];
  organization.projects?.forEach((project) => {
    project.sites?.forEach((site) => {
      sites.push(site);
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
  organization.projects?.forEach((project) => {
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
      projectName: projectsById.get(site.id)?.name || '',
    };
  });
  return newSites;
};
