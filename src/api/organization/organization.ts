import {AxiosResponse} from 'axios';
import axios from 'src/api/index';
import {SeedBank, Organization, PlantLayer, Project, Site} from 'src/types/Organization';
import {paths} from 'src/api/types/generated-schema';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}`;

const PROJECTS = '/api/v1/projects';
type ListProjectsResponse = paths[typeof PROJECTS]['get']['responses'][200]['content']['application/json'];

async function getProjects(): Promise<Project[]> {
  const response: ListProjectsResponse = (await axios.get(`${BASE_URL}${PROJECTS}`)).data;
  return response.projects.map((project) => ({
      id: project.id,
      name: project.name
  }));
}

const SITES = '/api/v1/sites';
type ListSitesResponse = paths[typeof SITES]['get']['responses'][200]['content']['application/json'];

async function getSites(): Promise<Site[]> {
  const sitesResponse: ListSitesResponse = (await axios.get(`${BASE_URL}${SITES}`)).data;
  return sitesResponse.sites.map((site) => ({
      id: site.id,
      projectId: site.projectId
  }));
}

const LAYERS = '/api/v1/gis/layers/list/{siteId}';
type ListLayersResponse = paths[typeof LAYERS]['get']['responses'][200]['content']['application/json'];
type LayerResponse = ListLayersResponse['layers'][0];

async function getPlantLayers(sites: Site[]): Promise<PlantLayer[]> {
  // We may want to add functionality to allow fetching of some layers to fail
  // while still returning those that were fetched successfully
  const axiosResponse : AxiosResponse<ListLayersResponse>[] = await Promise.all(
    sites.map((site) => axios.get(`${BASE_URL}${LAYERS}`.replace('{siteId}', `${site.id}`)))
  );

  const layers: PlantLayer[] = [];
  axiosResponse.forEach((response) => {
    response.data.layers.forEach((layer: LayerResponse) => {
      if (layer.layerType === 'Plants Planted') {
        layers.push({
          id: layer.id,
          siteId: layer.siteId,
        });
      }
    });
  });

  return layers;
}

const FACILITIES = '/api/v1/facility';
type ListFacilitiesResponse = paths[typeof FACILITIES]['get']['responses'][200]['content']['application/json'];

async function getSeedBankFacilities(): Promise<SeedBank[]> {
  const facilitiesResponse: ListFacilitiesResponse = (await axios.get(`${BASE_URL}${FACILITIES}`)).data;
  const seedBanks: SeedBank[] = [];
  facilitiesResponse.facilities.forEach((facility) => {
    if (facility.type === 'Seed Bank') {
      seedBanks.push({
        id: facility.id,
        siteId: facility.siteId,
      });
    }
  });
  return seedBanks;
}

export enum OrgRequestError {
  NoProjects = 'API_RETURNED_EMPTY_PROJECT_LIST',
  NoSites = 'API_RETURNED_EMPTY_SITE_LIST',
  ErrorFetchingProjectsOrSites = 'UNRECOVERABLE_ERROR_FETCHING_PROJECTS_OR_SITES',
  ErrorFetchingLayers = 'UNRECOVERABLE_ERROR_FETCHING_LAYERS',
  ErrorFetchingFacilities = 'UNRECOVERABLE_ERROR_FETCHING_FACILITIES',
}

export type GetOrganizationResponse = {
  organization: Organization,
  errors: OrgRequestError[],
};

/*
 * getOrganization() always returns a promise that resolves.
 * If we successfully fetched all organization data, the result will contain
 *    all of the user's projects, sites, seed bank facilities, and plants planted layers
 *    an empty errors list
 * If we were unable to fetch all organization data, the result will contain
 *    any data that we were able to fetch
 *    a non-empty errors list indicating what went wrong
 */
async function getOrganization(): Promise<GetOrganizationResponse> {
  const OrgResponse : GetOrganizationResponse = {
    organization: {
      projects: [],
      sites: [],
      facilities: [],
      layers: [],
    },
    errors: [],
  };

  try {
    const [projects, sites] = await Promise.all([getProjects(), getSites()]);
    if (projects.length === 0) {
      OrgResponse.errors.push(OrgRequestError.NoProjects);
      return OrgResponse;
    }
    OrgResponse.organization.projects = projects;
    if (sites.length === 0) {
      OrgResponse.errors.push(OrgRequestError.NoSites);
      return OrgResponse;
    }
    OrgResponse.organization.sites = sites;
  } catch (error) {
    console.error(error);
    OrgResponse.errors.push(OrgRequestError.ErrorFetchingProjectsOrSites);
    return OrgResponse;
  }

  const [facilitiesResponse, layersResponse] = await Promise.allSettled(
    [getSeedBankFacilities(), getPlantLayers(OrgResponse.organization.sites)]
  );
  if (facilitiesResponse.status === 'fulfilled') {
    OrgResponse.organization.facilities = facilitiesResponse.value;
  } else {
    console.error(facilitiesResponse.reason);
    OrgResponse.errors.push(OrgRequestError.ErrorFetchingFacilities);
  }
  if (layersResponse.status === 'fulfilled') {
    OrgResponse.organization.layers = layersResponse.value;
  } else {
    console.error(layersResponse.reason);
    OrgResponse.errors.push(OrgRequestError.ErrorFetchingLayers);
  }

  return OrgResponse;
}

export const exportedForTesting = {
  getLayers: getPlantLayers,
};

export default getOrganization;
