import { AxiosResponse } from 'axios';
import axios from 'src/api/index';
import { PlantLayer, Site, ServerOrganization, Project } from 'src/types/Organization';
import { paths } from 'src/api/types/generated-schema';
import { Facility } from '../types/facilities';

const LAYERS = '/api/v1/gis/layers/list/{siteId}';
type ListLayersResponse = paths[typeof LAYERS]['get']['responses'][200]['content']['application/json'];
type LayerResponse = ListLayersResponse['layers'][0];

type GetPlantLayersResponse = {
  layers: PlantLayer[];
  requestSucceeded: boolean;
};

export async function getPlantLayers(sites: Site[]): Promise<GetPlantLayersResponse> {
  // We may want to add functionality to allow fetching of some layers to fail
  // while still returning those that were fetched successfully
  const response: GetPlantLayersResponse = {
    layers: [],
    requestSucceeded: true,
  };
  try {
    const axiosResponse: AxiosResponse<ListLayersResponse>[] = await Promise.all(
      sites.map((site) => axios.get(LAYERS.replace('{siteId}', `${site.id}`)))
    );

    axiosResponse.forEach((serResponse) => {
      serResponse.data.layers.forEach((layer: LayerResponse) => {
        if (layer.layerType === 'Plants Planted') {
          response.layers.push({
            id: layer.id,
            siteId: layer.siteId,
          });
        }
      });
    });
  } catch {
    response.requestSucceeded = false;
  }

  return response;
}

export const exportedForTesting = {
  getLayers: getPlantLayers,
};

const ORGANIZATIONS = '/api/v1/organizations';
type ListOrganizationsResponsePayload =
  paths[typeof ORGANIZATIONS]['get']['responses'][200]['content']['application/json'];

type ServerOrg = ListOrganizationsResponsePayload['organizations'][0];

type ServerProject = Required<ServerOrg>['projects'][0];

type ServerSite = Required<ServerProject>['sites'][0];

type ServerFacility = Required<ServerSite>['facilities'][0];

type OrganizationsResponse = {
  organizations: ServerOrganization[];
  requestSucceeded: boolean;
};

const parseProject = (project: ServerProject): Project => {
  const parsedProject: Project = {
    id: project.id,
    name: project.name,
    sites: project.sites?.map((site) => parseSite(site)),
  };
  return parsedProject;
};

const parseSite = (site: ServerSite): Site => {
  const parsedSite: Site = {
    id: site.id,
    name: site.name,
    projectId: site.projectId,
    facilities: site.facilities?.map((facility) => parseFacility(facility)),
    latitude: site.location?.coordinates ? site.location.coordinates[1] : undefined,
    longitude: site.location?.coordinates ? site.location.coordinates[0] : undefined,
  };
  return parsedSite;
};

const parseFacility = (facility: ServerFacility): Facility => {
  const parsedFacility: Facility = {
    id: facility.id,
    name: facility.name,
    type: facility.type,
  };
  return parsedFacility;
};
export async function getOrganizations(): Promise<OrganizationsResponse> {
  const response: OrganizationsResponse = {
    organizations: [],
    requestSucceeded: true,
  };
  try {
    const organizationsResponse: ListOrganizationsResponsePayload = (await axios.get(`${ORGANIZATIONS}?depth=Facility`))
      .data;
    response.organizations = organizationsResponse.organizations.map((organization) => ({
      id: organization.id,
      name: organization.name,
      role: organization.role,
      projects: organization.projects?.map((project) => parseProject(project)),
    }));
  } catch {
    response.requestSucceeded = false;
  }
  return response;
}

type ProjectResponse = {
  project: Project | null;
  requestSucceeded: boolean;
};

const PROJECT = '/api/v1/projects/{id}';
type GetProjectResponsePayload = paths[typeof PROJECT]['get']['responses'][200]['content']['application/json'];

export async function getProject(projectId: string): Promise<ProjectResponse> {
  const response: ProjectResponse = {
    project: null,
    requestSucceeded: true,
  };

  try {
    const serverResponse: GetProjectResponsePayload = (await axios.get(PROJECT.replace('{id}', projectId))).data;
    response.project = serverResponse.project;
  } catch {
    response.requestSucceeded = false;
  }

  return response;
}
