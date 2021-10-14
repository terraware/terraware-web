import axios, {AxiosResponse} from 'axios';
import {SeedBank, Organization, PlantLayer, Project, Site} from '../../types/Organization';
import {paths} from '../types/generated-schema';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}`;

const PROJECTS = '/api/v1/projects';
type ListProjectsResponse = paths[typeof PROJECTS]['get']['responses'][200]['content']['application/json'];

const getProjects = async (): Promise<Project[]> => {
  const response: ListProjectsResponse = (await axios.get(`${BASE_URL}${PROJECTS}`)).data;
  return response.projects.map((project) => {
    return {
      id: project.id,
      name: project.name
    };
  });
};

const SITES = '/api/v1/sites';
type ListSitesResponse = paths[typeof SITES]['get']['responses'][200]['content']['application/json'];

const getSites = async (): Promise<Site[]> => {
  const sitesResponse: ListSitesResponse = (await axios.get(`${BASE_URL}${SITES}`)).data;
  return sitesResponse.sites.map((site) => ({
      id: site.id,
      projectId: site.projectId
    }));
};

const LAYERS = '/api/v1/gis/layers/list/{siteId}';
type ListLayersResponse = paths[typeof LAYERS]['get']['responses'][200]['content']['application/json'];
type LayerResponse = ListLayersResponse['layers'][0];

const getPlantLayers = async (sites: Site[]): Promise<PlantLayer[]> => {
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
};

const FACILITIES = '/api/v1/facility';
type ListFacilitiesResponse = paths[typeof FACILITIES]['get']['responses'][200]['content']['application/json'];

const getSeedBankFacilities = async(): Promise<SeedBank[]> => {
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
};

export enum OrgRequestError {
  NoProjects = 'API_RETURNED_EMPTY_PROJECT_LIST',
  NoSites = 'API_RETURNED_EMPTY_SITE_LIST',
  ErrorFetchingProjectsOrSites = 'UNRECOVERABLE_ERROR_FETCHING_PROJECTS_OR_SITES',
}

export type GetOrganizationResponse = {
  organization: Organization,
  error: OrgRequestError | null,
};

// getOrganization() always returns a promise that resolves. All errors are wrapped in the response object.
const getOrganization = async (): Promise<GetOrganizationResponse> => {
  const response : GetOrganizationResponse = {
    organization: {
      projects: [],
      sites: [],
      facilities: [],
      layers: [],
    },
    error: null,
  };

  try {
    const [projects, sites] = await Promise.all([getProjects(), getSites()]);
    if (projects.length === 0) {
      response.error = OrgRequestError.NoProjects;
      return response;
    }
    if (sites.length === 0) {
      response.error = OrgRequestError.NoSites;
      return response;
    }
    response.organization.projects = projects;
    response.organization.sites = sites;
  } catch (error) {
    console.error(error);
    response.error = OrgRequestError.ErrorFetchingProjectsOrSites;
    return response;
  }

  const [facilitiesResponse, layersResponse] = await Promise.allSettled(
    [getSeedBankFacilities(), getPlantLayers(response.organization.sites)]
  );
  if (facilitiesResponse.status === 'fulfilled') {
    response.organization.facilities = facilitiesResponse.value;
  } else {
    console.error(facilitiesResponse.reason);
  }
  if (layersResponse.status === 'fulfilled') {
    response.organization.layers = layersResponse.value;
  } else {
    console.error(layersResponse.reason);
  }

  return response;
};

export const exportedForTesting = {
  getLayers: getPlantLayers,
};

export default getOrganization;
