import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from './HttpService';
import { OrganizationRole } from 'src/types/Organization';
import { OrganizationUser } from 'src/types/User';

/**
 * Service for organization user related functionality
 */

/**
 * Types exported from service
 */
export type OrganizationUsers = {
  users: OrganizationUser[];
};

export type OrganizationUsersResponse = Response & OrganizationUsers;

export type CreateOrganizationUserError = 'PRE_EXISTING_USER' | 'INVALID_EMAIL';

export type CreateOrganizationUserResponse = Response & {
  userId: number;
  errorDetails?: CreateOrganizationUserError;
};

// endpoint
const ORGANIZATION_USERS_ENDPOINT = '/api/v1/organizations/{organizationId}/users';
const ORGANIZATION_USER_ENDPOINT = '/api/v1/organizations/{organizationId}/users/{userId}';

type OrganizationUsersServerResponse =
  paths[typeof ORGANIZATION_USERS_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type CreateOrganizationUserResponsePayload =
  paths[typeof ORGANIZATION_USERS_ENDPOINT]['post']['responses'][200]['content']['application/json'];
type CreateOrganizationUserRequestPayload =
  paths[typeof ORGANIZATION_USERS_ENDPOINT]['post']['requestBody']['content']['application/json'];
type UpdateOrganizationUserRequestPayload =
  paths[typeof ORGANIZATION_USER_ENDPOINT]['put']['requestBody']['content']['application/json'];

const httpOrganizationUsers = HttpService.root(ORGANIZATION_USERS_ENDPOINT);
const httpOrganizationUser = HttpService.root(ORGANIZATION_USER_ENDPOINT);

/**
 * get organization useres
 */
const getOrganizationUsers = async (organizationId: number): Promise<OrganizationUsersResponse> => {
  const response: OrganizationUsersResponse = await httpOrganizationUsers.get<
    OrganizationUsersServerResponse,
    OrganizationUsers
  >(
    {
      urlReplacements: {
        '{organizationId}': organizationId.toString(),
      },
    },
    (data) => ({ users: data?.users ?? [] })
  );

  return response;
};

/**
 * create an organization user
 */
const createOrganizationUser = async (
  organizationId: number,
  user: Omit<OrganizationUser, 'id'>
): Promise<CreateOrganizationUserResponse> => {
  const { email, role } = user;
  const request: CreateOrganizationUserRequestPayload = { email, role };

  const serverResponse: Response = await httpOrganizationUsers.post({
    entity: request,
    urlReplacements: {
      '{organizationId}': organizationId.toString(),
    },
  });
  const response: CreateOrganizationUserResponse = { ...serverResponse, userId: -1 };

  if (response.requestSucceeded) {
    const data: CreateOrganizationUserResponsePayload = response.data;
    response.userId = data?.id as number;
  } else {
    if (response.statusCode === 409) {
      // conflict
      response.errorDetails = 'PRE_EXISTING_USER';
    } else if (response.error === 'Field value has incorrect format: email') {
      response.errorDetails = 'INVALID_EMAIL';
    }
  }

  return response;
};

/**
 * update an organization user
 */
const updateOrganizationUser = async (
  organizationId: number,
  userId: number,
  role: OrganizationRole
): Promise<Response> => {
  const request: UpdateOrganizationUserRequestPayload = { role };

  const response: Response = await httpOrganizationUser.put({
    entity: request,
    urlReplacements: {
      '{organizationId}': organizationId.toString(),
      '{userId}': userId.toString(),
    },
  });

  return response;
};

/**
 * delete an organization user
 */
const deleteOrganizationUser = async (organizationId: number, userId: number): Promise<Response> => {
  const response: Response = await httpOrganizationUser.delete({
    urlReplacements: {
      '{organizationId}': organizationId.toString(),
      '{userId}': userId.toString(),
    },
  });

  return response;
};

/**
 * Exported functions
 */
const OrganizationUserService = {
  getOrganizationUsers,
  createOrganizationUser,
  updateOrganizationUser,
  deleteOrganizationUser,
};

export default OrganizationUserService;
