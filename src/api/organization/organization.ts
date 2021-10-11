import axios, {AxiosResponse} from 'axios';
import { Organization, Project, Site, Facility, Layer } from '../../types/Organization';
import { components } from '../types/generated-schema';

type ListProjectsResponsePayload = components['schemas']['ListProjectsResponsePayload'];
type ListSitesResponsePayload = components['schemas']['ListSitesResponsePayload'];
type ListFacilitiesResponse = components['schemas']['ListFacilitiesResponse'];
type ListLayersResponsePayload = components['schemas']['ListLayersResponsePayload'];
type LayerResponse = components['schemas']['LayerResponse'];

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1`;

const getProjects = async (): Promise<Project[]> => {
  const response: ListProjectsResponsePayload = (await axios.get(`${BASE_URL}/projects`)).data;
  return response.projects.map((project) => {
    return {
      id: project.id,
      name: project.name
    };
  });
};

const getSites = async (): Promise<Site[]> => {
  const sitesResponse: ListSitesResponsePayload = (await axios.get(`${BASE_URL}/sites`)).data;
  return sitesResponse.sites.map((site) => {
    return {
      id: site.id,
      projectId: site.projectId
    };
  });
};

const getLayers = async (sites: Site[]): Promise<Layer[]> => {
  // We may want to add functionality to allow fetching of some layers to fail
  // while still returning those that could be fetched successfully
  const axiosResponse : AxiosResponse<ListLayersResponsePayload>[] = await Promise.all(
    sites.map((site) => axios.get(`${BASE_URL}/gis/layers/list/${site.id}`))
  );

  return (axiosResponse.map((response) => {
    return response.data.layers.map((layer: LayerResponse) => {
      return {
        id: layer.id,
        siteId: layer.siteId,
        layerType: layer.layerType
      };
    });
  }).flat());
};

const getFacilities = async(): Promise<Facility[]> => {
  const facilitiesResponse: ListFacilitiesResponse = (await axios.get(`${BASE_URL}/facility`)).data;
  return facilitiesResponse.facilities.map((facility) => {
    return {
      id: facility.id,
      siteId: facility.siteId,
      type: facility.type,
    };
  });
};

export enum OrgRequestError {
  NoProjects = 'API_RETURNED_EMPTY_PROJECT_LIST',
  NoSites = 'API_RETURNED_EMPTY_SITE_LIST',
  AxiosError = 'AXIOS_ERROR_FETCHING_PROJECTS_OR_SITES',
}

export type getOrganizationResponse = {
  organization: Organization,
  error: OrgRequestError | null,
};

const getOrganization = async (): Promise<getOrganizationResponse> => {
  const response : getOrganizationResponse = {
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
    console.error(`${error.request.status} error fetching projects or sites.`);
    response.error = OrgRequestError.AxiosError;
    return response;
  }

  const [facilitiesResponse, layersResponse] = await Promise.allSettled(
    [getFacilities(), getLayers(response.organization.sites)]
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
  getLayers,
};

export default getOrganization;
