import { AxiosResponse } from 'axios';
import axios from 'src/api/index';
import { PlantLayer, Site, ServerOrganization, Project } from 'src/types/Organization';
import { paths } from 'src/api/types/generated-schema';
import { Facility } from '../types/facilities';
import { OrganizationUser } from 'src/types/User';

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

const parseProject = (project: ServerProject): Project => {
  const parsedProject: Project = {
    id: project.id,
    name: project.name,
    description: project.description,
    startDate: project.startDate,
    status: project.status,
    types: project.types,
    sites: project.sites?.map((site) => parseSite(site)),
    organizationId: project.organizationId,
    totalUsers: project.totalUsers,
    hidden: project.hidden,
  };
  return parsedProject;
};

const parseSite = (site: ServerSite): Site => {
  const parsedSite: Site = {
    id: site.id,
    name: site.name,
    description: site.description,
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

type OrganizationsResponse = {
  organizations: ServerOrganization[];
  error: null | 'NotAuthenticated' | 'GenericError';
};

export async function getOrganizations(): Promise<OrganizationsResponse> {
  const response: OrganizationsResponse = {
    organizations: [],
    error: null,
  };

  try {
    const organizationsResponse: ListOrganizationsResponsePayload = (await axios.get(`${ORGANIZATIONS}?depth=Facility`))
      .data;
    response.organizations = organizationsResponse.organizations.map((organization) => ({
      id: organization.id,
      name: organization.name,
      role: organization.role,
      projects: organization.projects?.map((project) => parseProject(project)),
      description: organization.description,
      countryCode: organization.countryCode,
      countrySubdivisionCode: organization.countrySubdivisionCode,
      createdTime: organization.createdTime,
    }));
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      response.error = 'NotAuthenticated';
    } else {
      response.error = 'GenericError';
    }
  }

  return response;
}

const ORGANIZATION_USERS = '/api/v1/organizations/{organizationId}/users';
type ListOrganizationUsersResponsePayload =
  paths[typeof ORGANIZATION_USERS]['get']['responses'][200]['content']['application/json'];

type OrganizationUsersResponse = {
  users: OrganizationUser[];
  requestSucceeded: boolean;
};
export async function getOrganizationUsers(organization: ServerOrganization): Promise<OrganizationUsersResponse> {
  const response: OrganizationUsersResponse = {
    users: [],
    requestSucceeded: true,
  };
  try {
    const usersResponse: ListOrganizationUsersResponsePayload = (
      await axios.get(ORGANIZATION_USERS.replace('{organizationId}', organization.id.toString()))
    ).data;
    response.users = usersResponse.users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      projectIds: user.projectIds,
      addedTime: user.addedTime,
    }));
  } catch {
    response.requestSucceeded = false;
  }
  return response;
}

type UpdateOrganizationResponsePayload =
  paths[typeof ORGANIZATIONS]['post']['responses'][200]['content']['application/json'];
type UpdateOrganizationRequestPayload =
  paths[typeof ORGANIZATIONS]['post']['requestBody']['content']['application/json'];

type CreateOrganizationResponse = {
  organization: ServerOrganization | null;
  requestSucceeded: boolean;
};
export async function createOrganization(organization: ServerOrganization) {
  const response: CreateOrganizationResponse = {
    organization: null,
    requestSucceeded: true,
  };
  try {
    const newOrganization: UpdateOrganizationRequestPayload = {
      name: organization.name,
      description: organization.description,
      countryCode: organization.countryCode,
      countrySubdivisionCode: organization.countrySubdivisionCode,
    };
    const serverResponse: UpdateOrganizationResponsePayload = (await axios.post(ORGANIZATIONS, newOrganization)).data;

    if (serverResponse.status === 'ok') {
      response.organization = {
        id: serverResponse.organization.id,
        name: serverResponse.organization.name,
        role: serverResponse.organization.role,
        description: serverResponse.organization.description,
        projects: serverResponse.organization.projects,
        countryCode: serverResponse.organization.countryCode,
        countrySubdivisionCode: serverResponse.organization.countrySubdivisionCode,
      };
    } else {
      response.requestSucceeded = false;
    }
  } catch {
    response.requestSucceeded = false;
  }
  return response;
}

const UPDATE_ORGANIZATION = '/api/v1/organizations/{organizationId}';

type UpdateOrganizationResponse = {
  requestSucceeded: boolean;
};
type SimpleSuccessResponsePayload =
  paths[typeof UPDATE_ORGANIZATION]['put']['responses'][200]['content']['application/json'];

export async function updateOrganization(organization: ServerOrganization): Promise<UpdateOrganizationResponse> {
  const response: UpdateOrganizationResponse = {
    requestSucceeded: true,
  };
  try {
    const updatedOrganization: UpdateOrganizationRequestPayload = {
      name: organization.name,
      description: organization.description,
      countryCode: organization.countryCode,
      countrySubdivisionCode: organization.countrySubdivisionCode,
    };
    const serverResponse: SimpleSuccessResponsePayload = (
      await axios.put(UPDATE_ORGANIZATION.replace('{organizationId}', organization.id.toString()), updatedOrganization)
    ).data;

    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    }
  } catch {
    response.requestSucceeded = false;
  }
  return response;
}

const LEAVE_ORGANIZATION = '/api/v1/organizations/{organizationId}/users/{userId}';

type LeaveOrganizationResponse = {
  requestSucceeded: boolean;
};

export async function leaveOrganization(organizationId: number, userId: number): Promise<UpdateOrganizationResponse> {
  const response: LeaveOrganizationResponse = {
    requestSucceeded: true,
  };
  try {
    const serverResponse: SimpleSuccessResponsePayload = (
      await axios.delete(
        LEAVE_ORGANIZATION.replace('{organizationId}', organizationId.toString()).replace('{userId}', userId.toString())
      )
    ).data;

    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    }
  } catch {
    response.requestSucceeded = false;
  }
  return response;
}
