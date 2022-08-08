import axios from 'src/api/index';
import { paths } from 'src/api/types/generated-schema';

const PREFERENCES = '/api/v1/users/me/preferences';
type GetUserPreferencesResponsePayload =
  paths[typeof PREFERENCES]['get']['responses'][200]['content']['application/json'];

type PreferencesResponse = {
  preferences?: { [key: string]: unknown };
  requestSucceeded: boolean;
};

export async function getPreferences(): Promise<PreferencesResponse> {
  const response: PreferencesResponse = {
    preferences: {},
    requestSucceeded: true,
  };

  try {
    const serverResponse: GetUserPreferencesResponsePayload = (await axios.get(`${PREFERENCES}`)).data;
    response.preferences = serverResponse.preferences;
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
  preferences: { [key: string]: unknown },
  organizationId?: number
): Promise<UpdateUserPreferences> {
  const response: UpdateUserPreferences = {
    requestSucceeded: true,
  };
  try {
    const updatedPreferences: UpdateUserPreferencesRequestPayload = {
      organizationId,
      preferences,
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
