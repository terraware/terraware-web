import { Project, ServerOrganization, Site } from 'src/types/Organization';

const getAllSites = (organization: ServerOrganization): Site[] => {
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
