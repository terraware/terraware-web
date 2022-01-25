import axios, { AxiosError } from 'axios';
import { OrganizationUser, User } from 'src/types/User';
import { paths } from '../types/generated-schema';

const GET_USER_ENDPOINT = '/api/v1/users/me';

type UserResponse = paths[typeof GET_USER_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type GetUserResponse = {
  user: User | null;
  requestSucceeded: boolean;
};

export async function getUser(): Promise<GetUserResponse> {
  const response: GetUserResponse = {
    user: null,
    requestSucceeded: true,
  };

  try {
    const serverResponse: UserResponse = (await axios.get(GET_USER_ENDPOINT)).data;
    response.user = {
      email: serverResponse.user.email,
      firstName: serverResponse.user.firstName,
      lastName: serverResponse.user.lastName,
    };
  } catch {
    response.requestSucceeded = false;
  }

  return response;
}

const CREATE_USER_ENDPOINT = '/api/v1/organizations/{organizationId}/users';

type SimpleSuccessResponsePayload =
  paths[typeof CREATE_USER_ENDPOINT]['post']['responses'][200]['content']['application/json'];

type AddOrganizationUserRequestPayload =
  paths[typeof CREATE_USER_ENDPOINT]['post']['requestBody']['content']['application/json'];

export type CreateUserResponse = {
  requestSucceeded: boolean;
  existingUser: boolean;
};
export async function addOrganizationUser(user: OrganizationUser, organizationId: number): Promise<CreateUserResponse> {
  const url = CREATE_USER_ENDPOINT.replace('{organizationId}', organizationId.toString());
  const response: CreateUserResponse = {
    requestSucceeded: true,
    existingUser: false,
  };
  const addOrganizationUserRequestPayload: AddOrganizationUserRequestPayload = {
    email: user.email,
    projectIds: user.projectIds,
    role: user.role,
  };
  try {
    const serverResponse: SimpleSuccessResponsePayload = (await axios.post(url, addOrganizationUserRequestPayload))
      .data;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    }
  } catch (error) {
    if ((error as AxiosError).response?.status === 409) {
      response.existingUser = true;
    }
    response.requestSucceeded = false;
  }

  return response;
}
