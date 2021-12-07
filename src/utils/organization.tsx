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
