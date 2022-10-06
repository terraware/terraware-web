import axios from 'src/api/index';
import { paths } from 'src/api/types/generated-schema';

const PREFERENCES = '/api/v1/users/me/preferences';
type GetUserPreferencesResponsePayload =
  paths[typeof PREFERENCES]['get']['responses'][200]['content']['application/json'];

type PreferencesResponse = {
  preferences?: { [key: string]: unknown };
  requestSucceeded: boolean;
};

const userPreferences: any = {};

export async function getPreferences(organizationId?: number): Promise<PreferencesResponse> {
  const response: PreferencesResponse = {
    preferences: {},
    requestSucceeded: true,
  };

  try {
    const endPoint = organizationId ? `${PREFERENCES}?organizationId=${organizationId}` : PREFERENCES;
    const serverResponse: GetUserPreferencesResponsePayload = (await axios.get(`${endPoint}`)).data;
    response.preferences = serverResponse.preferences || {};
    userPreferences[organizationId ? organizationId : 'global'] = { ...response.preferences };
  } catch (error) {
    response.requestSucceeded = false;
  }

  return response;
}

type UpdateUserPreferencesRequestPayload =
  paths[typeof PREFERENCES]['put']['requestBody']['content']['application/json'];

export type UpdateUserPreferences = {
  requestSucceeded: boolean;
};
type SimpleSuccessResponsePayload = paths[typeof PREFERENCES]['put']['responses'][200]['content']['application/json'];

export async function updatePreferences(
  name: string,
  value: any,
  organizationId?: number
): Promise<UpdateUserPreferences> {
  const response: UpdateUserPreferences = {
    requestSucceeded: true,
  };
  try {
    const serverPreferences = await getPreferences();
    const existingPreferences = serverPreferences.preferences;
    const newPreferences = { ...existingPreferences, [name]: value };
    const updatedPreferences: UpdateUserPreferencesRequestPayload = {
      organizationId,
      preferences: newPreferences,
    };
    const serverResponse: SimpleSuccessResponsePayload = (await axios.put(PREFERENCES, updatedPreferences)).data;

    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    } else {
      userPreferences[organizationId ? organizationId : 'global'] = { ...newPreferences };
    }
  } catch {
    response.requestSucceeded = false;
  }
  return response;
}

// get current user preferences
export const getCurrentUserPreferences = (organizationId?: number) => {
  let preferences;
  if (organizationId) {
    preferences = userPreferences[organizationId];
  } else {
    preferences = userPreferences.global;
  }
  return preferences ? { ...preferences } : {};
};
