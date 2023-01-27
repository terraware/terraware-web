import axios from 'src/api/index';
import { Organization } from 'src/types/Organization';
import { paths } from 'src/api/types/generated-schema';
import { Facility } from '../types/facilities';
import { OrganizationUser } from 'src/types/User';
import { InitializedTimeZone } from 'src/types/TimeZones';
import { isAdmin } from 'src/utils/organization';
import { PreferencesService, CachedUserService } from 'src/services';

const ORGANIZATIONS = '/api/v1/organizations';
type ListOrganizationsResponsePayload =
  paths[typeof ORGANIZATIONS]['get']['responses'][200]['content']['application/json'];

type ServerFacility = Required<Organization>['facilities'][0];

const parseFacility = (facility: ServerFacility): Facility => {
  const parsedFacility: Facility = {
    id: facility.id,
    name: facility.name,
    type: facility.type,
    organizationId: facility.organizationId,
    description: facility.description,
    connectionState: facility.connectionState,
    timeZone: facility.timeZone,
  };
  return parsedFacility;
};

type OrganizationsResponse = {
  organizations: Organization[];
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
      facilities: organization.facilities?.map((facility) => parseFacility(facility)),
      description: organization.description,
      countryCode: organization.countryCode,
      countrySubdivisionCode: organization.countrySubdivisionCode,
      createdTime: organization.createdTime,
      totalUsers: organization.totalUsers,
      timeZone: organization.timeZone,
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
export async function getOrganizationUsers(organization: Organization): Promise<OrganizationUsersResponse> {
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
  organization: Organization | null;
  requestSucceeded: boolean;
};
export async function createOrganization(organization: Organization) {
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
      timeZone: organization.timeZone,
    };
    const serverResponse: UpdateOrganizationResponsePayload = (await axios.post(ORGANIZATIONS, newOrganization)).data;

    if (serverResponse.status === 'ok') {
      response.organization = {
        id: serverResponse.organization.id,
        name: serverResponse.organization.name,
        role: serverResponse.organization.role,
        description: serverResponse.organization.description,
        facilities: serverResponse.organization.facilities,
        countryCode: serverResponse.organization.countryCode,
        countrySubdivisionCode: serverResponse.organization.countrySubdivisionCode,
        totalUsers: serverResponse.organization.totalUsers,
        timeZone: serverResponse.organization.timeZone,
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

export type UpdateOrganizationResponse = {
  requestSucceeded: boolean;
};
type SimpleSuccessResponsePayload =
  paths[typeof UPDATE_ORGANIZATION]['put']['responses'][200]['content']['application/json'];

export async function updateOrganization(
  organization: Organization,
  skipAcknowledgeTimeZone?: boolean
): Promise<UpdateOrganizationResponse> {
  const response: UpdateOrganizationResponse = {
    requestSucceeded: true,
  };
  try {
    const updatedOrganization: UpdateOrganizationRequestPayload = {
      name: organization.name,
      description: organization.description,
      countryCode: organization.countryCode,
      countrySubdivisionCode: organization.countrySubdivisionCode,
      timeZone: organization.timeZone,
    };
    const serverResponse: SimpleSuccessResponsePayload = (
      await axios.put(UPDATE_ORGANIZATION.replace('{organizationId}', organization.id.toString()), updatedOrganization)
    ).data;

    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    } else if (organization.timeZone && !skipAcknowledgeTimeZone) {
      await PreferencesService.updateUserOrgPreferences(organization.id, { timeZoneAcknowledgedOnMs: Date.now() });
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
    const url = LEAVE_ORGANIZATION.replace('{organizationId}', organizationId.toString()).replace(
      '{userId}',
      userId.toString()
    );
    const serverResponse: SimpleSuccessResponsePayload = (await axios.delete(url)).data;

    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    }
  } catch {
    response.requestSucceeded = false;
  }
  return response;
}

type OrganizationRolePayload = {
  role: 'Contributor' | 'Admin' | 'Owner' | 'Manager';
  totalUsers: number;
};

type ListOrganizationRolesResponse = {
  requestSucceeded: boolean;
  roles?: OrganizationRolePayload[];
};

type ListOrganizationRolesResponsePayload =
  paths[typeof ORGANIZATION_ROLES]['get']['responses'][200]['content']['application/json'];

const ORGANIZATION_ROLES = '/api/v1/organizations/{organizationId}/roles';
export async function listOrganizationRoles(organizationId: number): Promise<ListOrganizationRolesResponse> {
  const response: ListOrganizationRolesResponse = {
    requestSucceeded: true,
    roles: [],
  };
  try {
    const url = ORGANIZATION_ROLES.replace('{organizationId}', organizationId.toString());
    const serverResponse: ListOrganizationRolesResponsePayload = (await axios.get(url)).data;

    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    } else {
      serverResponse.roles.forEach((serverRole) => {
        const roleToAdd = {
          role: serverRole.role,
          totalUsers: serverRole.totalUsers,
        };
        response.roles?.push(roleToAdd);
      });
    }
  } catch {
    response.requestSucceeded = false;
  }
  return response;
}

export async function deleteOrganization(organizationId: number): Promise<UpdateOrganizationResponse> {
  const response: LeaveOrganizationResponse = {
    requestSucceeded: true,
  };
  try {
    const url = UPDATE_ORGANIZATION.replace('{organizationId}', organizationId.toString());
    const serverResponse: SimpleSuccessResponsePayload = (await axios.delete(url)).data;

    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    }
  } catch {
    response.requestSucceeded = false;
  }
  return response;
}

// initialize time zone (if not already set)
export const initializeOrganizationTimeZone = async (
  organization: Organization,
  timeZone: string
): Promise<InitializedTimeZone> => {
  const { timeZoneAcknowledgedOnMs } = CachedUserService.getUserOrgPreferences(organization.id);

  const initializedTimeZone: InitializedTimeZone = {
    timeZoneAcknowledgedOnMs,
  };

  if (!isAdmin(organization)) {
    return initializedTimeZone;
  }

  if (!organization.timeZone) {
    const response = await updateOrganization({ ...organization, timeZone }, true);
    if (response.requestSucceeded) {
      initializedTimeZone.updated = true;
      initializedTimeZone.timeZone = timeZone;
    }
  } else {
    initializedTimeZone.timeZone = organization.timeZone;
  }

  return initializedTimeZone;
};
