import axios from 'axios';
import { paths } from 'src/api/types/generated-schema';
import { OrganizationUser } from 'src/types/User';
import { AllOrganizationRoles } from 'src/types/Organization';

const CREATE_USER_ENDPOINT = '/api/v1/organizations/{organizationId}/users';

type SimpleSuccessResponsePayload =
  paths[typeof CREATE_USER_ENDPOINT]['post']['responses'][200]['content']['application/json'];

type AddOrganizationUserRequestPayload =
  paths[typeof CREATE_USER_ENDPOINT]['post']['requestBody']['content']['application/json'];

export type CreateUserResponse = {
  newUserId: number;
  requestSucceeded: boolean;
  errorDetails: undefined | 'PRE_EXISTING_USER' | 'INVALID_EMAIL';
};

export async function addOrganizationUser(user: OrganizationUser, organizationId: number): Promise<CreateUserResponse> {
  const url = CREATE_USER_ENDPOINT.replace('{organizationId}', organizationId.toString());
  const response: CreateUserResponse = {
    newUserId: -1,
    requestSucceeded: true,
    errorDetails: undefined,
  };
  const addOrganizationUserRequestPayload: AddOrganizationUserRequestPayload = {
    email: user.email,
    role: user.role,
  };
  try {
    const serverResponse: SimpleSuccessResponsePayload = (await axios.post(url, addOrganizationUserRequestPayload))
      .data;
    response.newUserId = serverResponse.id;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 409) {
        response.errorDetails = 'PRE_EXISTING_USER';
      } else if (
        error.response?.status === 400 &&
        error.response.data.error.message === 'Field value has incorrect format: email'
      ) {
        response.errorDetails = 'INVALID_EMAIL';
      }
    }
    response.requestSucceeded = false;
  }

  return response;
}

const UPDATE_ORG_USER_ENDPOINT = '/api/v1/organizations/{organizationId}/users/{userId}';

type UPDATE_ORG_USER_RESPONSE_PAYLOAD =
  paths[typeof UPDATE_ORG_USER_ENDPOINT]['put']['responses'][200]['content']['application/json'];

type UPDATE_ORG_USER_REQUEST_PAYLOAD =
  paths[typeof UPDATE_ORG_USER_ENDPOINT]['put']['requestBody']['content']['application/json'];

export type UpdateUserResponse = {
  requestSucceeded: boolean;
};

export async function updateOrganizationUser(
  userId: number,
  organizationId: number,
  newRole: AllOrganizationRoles
): Promise<UpdateUserResponse> {
  const response: UpdateUserResponse = { requestSucceeded: true };

  try {
    const url = UPDATE_ORG_USER_ENDPOINT.replace('{organizationId}', organizationId.toString()).replace(
      '{userId}',
      userId.toString()
    );
    const serverRequest: UPDATE_ORG_USER_REQUEST_PAYLOAD = { role: newRole };
    const serverResponse: UPDATE_ORG_USER_RESPONSE_PAYLOAD = await axios.put(url, serverRequest);
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
      throw Error;
    }
  } catch (error) {
    response.requestSucceeded = false;
  }

  return response;
}
