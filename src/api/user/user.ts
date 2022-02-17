import axios, { AxiosError } from 'axios';
import { updateProjectUser } from 'src/api/project/project';
import { paths } from 'src/api/types/generated-schema';
import { OrganizationUser, User } from 'src/types/User';
import { AllOrganizationRoles } from 'src/types/Organization';

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
  newUserId: number;
  requestSucceeded: boolean;
  isExistingUser: boolean;
};
export async function addOrganizationUser(user: OrganizationUser, organizationId: number): Promise<CreateUserResponse> {
  const url = CREATE_USER_ENDPOINT.replace('{organizationId}', organizationId.toString());
  const response: CreateUserResponse = {
    newUserId: -1,
    requestSucceeded: true,
    isExistingUser: false,
  };
  const addOrganizationUserRequestPayload: AddOrganizationUserRequestPayload = {
    email: user.email,
    projectIds: user.projectIds,
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
    if ((error as AxiosError).response?.status === 409) {
      response.isExistingUser = true;
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
  newRole: AllOrganizationRoles,
  addedProjectIds: number[],
  removedProjectIds: number[]
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

    // TODO: rollback changes if one change fails.
    const addedPromises = addedProjectIds.map((projectId) => updateProjectUser(projectId, userId, axios.post));
    const removedPromises = removedProjectIds.map((projectId) => updateProjectUser(projectId, userId, axios.delete));
    const projectUpdatePromises = addedPromises.concat(removedPromises);
    const projectUpdateResponses = await Promise.all(projectUpdatePromises);

    projectUpdateResponses.forEach((resp) => {
      if (!resp.requestSucceeded) {
        throw Error;
      }
    });
  } catch (error) {
    response.requestSucceeded = false;
  }

  return response;
}
