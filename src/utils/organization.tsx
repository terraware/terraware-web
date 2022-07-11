import { Facility } from 'src/api/types/facilities';
import { HighOrganizationRolesValues, Project, ServerOrganization, Site } from 'src/types/Organization';

export const getAllSeedBanks = (organization: ServerOrganization): (Facility | undefined)[] => {
  let seedBanks: (Facility | undefined)[] = [];
  if (organization && organization.facilities) {
    seedBanks = organization?.facilities?.filter((facility) => facility.type === 'Seed Bank');
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
  if (organization?.facilities && organization.facilities[0]) {
    return organization.facilities[0];
  }
  return null;
};

export const getOrganizationProjects = (organization: ServerOrganization | undefined) => {
  return organization?.projects?.filter((proj) => proj.name !== 'Seed Bank') || [];
};

export const isAdmin = (organization: ServerOrganization | undefined) => {
  return HighOrganizationRolesValues.includes(organization?.role || '');
};

export const setLastVisitedOrganizationId = (organizationId: number) => {
  localStorage.setItem('lastVisitedOrganization', organizationId.toString());
};

export const getLastVisitedOrganizationId = (): number | null => {
  const orgId = localStorage.getItem('lastVisitedOrganization');
  if (orgId) {
    return parseInt(orgId, 10);
  }
  return null;
};
