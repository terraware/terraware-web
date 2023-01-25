import HttpService, { Response } from './HttpService';
import CachedUserService from './CachedUserService';

/**
 * Service for preferences related functionality
 */

/**
 * Types exported from the service
 */
export type UserPreferencesResponse = Response & {
  preferences: Record<string, any>;
};

export type UserOrgPreferencesResponse = UserPreferencesResponse & {
  organizationId: number;
};

export type Preferences = Record<string, any>;

export type PreferencesResponse = UserPreferencesResponse | UserOrgPreferencesResponse;

export type UpdateResponse = Response & {
  preferences: Preferences;
};

// end point
const PREFERENCES_ENDPOINT = '/api/v1/users/me/preferences';

// http service
const httpPreferences = HttpService.root(PREFERENCES_ENDPOINT);

// primary get preferences code with optional org
const getPreferences = async (organizationId: string = ''): Promise<UserPreferencesResponse> => {
  const preferencesResponse: Response = await httpPreferences.get({
    params: organizationId ? { organizationId } : {},
  });
  const response: UserPreferencesResponse = { ...preferencesResponse, preferences: {} };

  if (response.requestSucceeded) {
    const { data } = response;
    if (data?.preferences) {
      response.preferences = data.preferences;
    }
  }

  return response;
};

// primary set preferences code
const updatePreferences = async (toUpdate: Preferences, organizationId?: number): Promise<UpdateResponse> => {
  const response: UserPreferencesResponse = await getPreferences(organizationId?.toString());

  if (response.requestSucceeded) {
    const preferences = { ...response.preferences, ...toUpdate };
    const entity = { organizationId, preferences };
    const updateResponse: Response = await httpPreferences.put({ entity });

    return { ...updateResponse, preferences };
  } else {
    return { requestSucceeded: false, preferences: {} };
  }
};

// get user preferences
const getUserPreferences = async (): Promise<UserPreferencesResponse> => {
  const response: UserPreferencesResponse = await getPreferences();

  if (response.requestSucceeded) {
    // TODO: remove after user preferences is in redux
    CachedUserService.setUserPreferences(response.preferences);
  }

  return response;
};

// get org preferences
const getUserOrgPreferences = async (organizationId: number): Promise<UserOrgPreferencesResponse> => {
  const preferencesResponse: UserPreferencesResponse = await getPreferences(organizationId.toString());
  const response: UserOrgPreferencesResponse = { ...preferencesResponse, organizationId };

  if (response.requestSucceeded) {
    // TODO: remove after user preferences is in redux
    CachedUserService.setUserOrgPreferences(organizationId, response.preferences);
  }

  return response;
};

// set user preferences
const updateUserPreferences = async (toUpdate: Preferences): Promise<UpdateResponse> => {
  const response: UpdateResponse = await updatePreferences(toUpdate);

  if (response.requestSucceeded) {
    // TODO: remove after user preferences is in redux
    CachedUserService.setUserPreferences(response.preferences);
  }

  return response;
};

// set org preferences
const updateUserOrgPreferences = async (organizationId: number, toUpdate: Preferences): Promise<UpdateResponse> => {
  const response: UpdateResponse = await updatePreferences(toUpdate, organizationId);

  if (response.requestSucceeded) {
    // TODO: remove after user preferences is in redux
    CachedUserService.setUserOrgPreferences(organizationId, response.preferences);
  }

  return response;
};

/**
 * The exported functions
 */
const PreferencesService = {
  getUserPreferences,
  getUserOrgPreferences,
  updateUserPreferences,
  updateUserOrgPreferences,
};

export default PreferencesService;
