import React from 'react';
import { Facility } from 'src/api/types/facilities';
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

export const getAllSitesForProject = (project: Project): Site[] => {
  const sites: Site[] = [];
  project.sites?.forEach((site) => {
    sites.push(site);
  });

  return sites;
};

export const getAllFacilities = (organization: ServerOrganization): Facility[] => {
  const facilities: Facility[] = [];
  organization.projects?.forEach((project) => {
    project.sites?.forEach((site) => {
      site.facilities?.forEach((facility) => {
        facilities.push(facility);
      });
    });
  });
  return facilities;
};

export const parseProject = (project: Project) => {
  const parsedProject: Project = {
    id: project.id,
    name: project.name,
    sites: project.sites?.map((site) => parseSite(site)),
  };
  return parsedProject;
};

export const parseSite = (site: Site) => {
  const parsedSite: Site = {
    id: site.id,
    name: site.name,
    projectId: site.projectId,
    facilities: site.facilities?.map((facility) => parseFacility(facility)),
  };
  return parsedSite;
};

export const parseFacility = (facility: Facility) => {
  const parsedFacility: Facility = {
    id: facility.id,
    name: facility.name,
    type: facility.type,
  };
  return parsedFacility;
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
