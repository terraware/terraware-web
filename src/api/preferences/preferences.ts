import axios from 'src/api/index';
import { paths } from 'src/api/types/generated-schema';

const PREFERENCES = '/api/v1/users/me/preferences';
type GetUserPreferencesResponsePayload =
  paths[typeof PREFERENCES]['get']['responses'][200]['content']['application/json'];

type PreferencesResponse = {
  preferences?: { [key: string]: unknown };
  requestSucceeded: boolean;
};

export async function getPreferences(organizationId?: number): Promise<PreferencesResponse> {
  const response: PreferencesResponse = {
    preferences: {},
    requestSucceeded: true,
  };

  try {
    const endPoint = organizationId ? `${PREFERENCES}?organizationId=${organizationId}` : PREFERENCES;
    const serverResponse: GetUserPreferencesResponsePayload = (await axios.get(`${endPoint}`)).data;
    response.preferences = serverResponse.preferences || {};
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
    const existingPrefs = serverPreferences.preferences;
    const newPrefs = { ...existingPrefs, [name]: value };
    const updatedPreferences: UpdateUserPreferencesRequestPayload = {
      organizationId,
      preferences: newPrefs,
    };
    const serverResponse: SimpleSuccessResponsePayload = (await axios.put(PREFERENCES, updatedPreferences)).data;

    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    }
  } catch {
    response.requestSucceeded = false;
  }
  return response;
}
