import axios from 'axios';
import { paths } from 'src/api/types/generated-schema';
import { OrganizationUser, User } from 'src/types/User';
import { AllOrganizationRoles } from 'src/types/Organization';
import { InitializedTimeZone } from 'src/types/TimeZones';
import { getCurrentUserPreferences, updatePreferences } from 'src/api/preferences/preferences';
import { InitializedUnits } from 'src/types/Units';

const CURRENT_USER_ENDPOINT = '/api/v1/users/me';

type UserResponse = paths[typeof CURRENT_USER_ENDPOINT]['get']['responses'][200]['content']['application/json'];

let currentUser: any = {};

const setCurrentUser = (user: User) => {
  const { email } = user;
  currentUser = {
    ...user,
    isTerraformation: !!email?.match(/@terraformation.com$/),
  };
};

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
    const serverResponse: UserResponse = (await axios.get(CURRENT_USER_ENDPOINT)).data;
    response.user = {
      id: serverResponse.user.id,
      email: serverResponse.user.email,
      firstName: serverResponse.user.firstName,
      lastName: serverResponse.user.lastName,
      emailNotificationsEnabled: serverResponse.user.emailNotificationsEnabled,
      timeZone: serverResponse.user.timeZone,
      locale: serverResponse.user.locale,
    };
    setCurrentUser(response.user);
  } catch {
    response.requestSucceeded = false;
  }

  return response;
}

type UPDATE_USER_REQUEST_PAYLOAD =
  paths[typeof CURRENT_USER_ENDPOINT]['put']['requestBody']['content']['application/json'];
type UPDATE_USER_RESPONSE_PAYLOAD =
  paths[typeof CURRENT_USER_ENDPOINT]['put']['responses'][200]['content']['application/json'];

export async function updateUserProfile(user: User, skipAcknowledgeTimeZone?: boolean): Promise<UpdateUserResponse> {
  const response: UpdateUserResponse = { requestSucceeded: true };
  try {
    const serverRequest: UPDATE_USER_REQUEST_PAYLOAD = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      timeZone: user.timeZone,
      locale: user.locale,
    };
    if (user.emailNotificationsEnabled !== undefined) {
      serverRequest.emailNotificationsEnabled = user.emailNotificationsEnabled;
    }
    const serverResponse: UPDATE_USER_RESPONSE_PAYLOAD = (await axios.put(CURRENT_USER_ENDPOINT, serverRequest)).data;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    } else {
      getUser(); // async user retrieval to set current user in memory
      if (user.timeZone && !skipAcknowledgeTimeZone) {
        await updatePreferences('timeZoneAcknowledgedOnMs', Date.now());
      }
    }
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

// get current user from service
export const getCurrentUser = () => ({ ...currentUser });

// initialize time zone (if not already set)
export const initializeUserTimeZone = async (user: User, timeZone: string): Promise<InitializedTimeZone> => {
  const { timeZoneAcknowledgedOnMs } = getCurrentUserPreferences();

  const initializedTimeZone: InitializedTimeZone = {
    timeZoneAcknowledgedOnMs,
  };

  if (!user.timeZone) {
    const response = await updateUserProfile({ ...user, timeZone }, true);
    if (response.requestSucceeded) {
      initializedTimeZone.updated = true;
      initializedTimeZone.timeZone = timeZone;
    }
  } else {
    initializedTimeZone.timeZone = user.timeZone;
  }

  return initializedTimeZone;
};

// initialize preferred units (if not already set)
export const initializeUserUnits = async (units: string): Promise<InitializedUnits> => {
  const { unitsAcknowledgedOnMs, preferredWeightSystem } = getCurrentUserPreferences();

  const initializedUnits: InitializedUnits = {
    unitsAcknowledgedOnMs,
  };

  if (!preferredWeightSystem) {
    const response = await updatePreferences('preferredWeightSystem', units);
    if (response.requestSucceeded) {
      initializedUnits.updated = true;
      initializedUnits.units = units;
    }
  } else {
    initializedUnits.units = preferredWeightSystem;
  }

  return initializedUnits;
};
