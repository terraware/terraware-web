import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from './HttpService';
import CachedUserService from './CachedUserService';
import PreferencesService from './PreferencesService';
import { User } from 'src/types/User';
import { InitializedTimeZone } from 'src/types/TimeZones';
import { InitializedUnits } from 'src/units';

/**
 * Service for user related functionality
 */

/**
 * Types exported from service
 */
export type UserData = {
  user?: User;
};

export type UserResponse = Response & UserData;

export type UpdateOptions = {
  skipAcknowledgeTimeZone?: boolean;
};

type CachedTimeZone = {
  cachedOn: number;
  promise: Promise<InitializedTimeZone> | null;
  updated: boolean;
};

// endpoint
const CURRENT_USER_ENDPOINT = '/api/v1/users/me';

type UserServerResponse = paths[typeof CURRENT_USER_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type UpdateUserPayloadType = paths[typeof CURRENT_USER_ENDPOINT]['put']['requestBody']['content']['application/json'];

const httpCurrentUser = HttpService.root(CURRENT_USER_ENDPOINT);

const cachedTimeZone: CachedTimeZone = {
  cachedOn: 0,
  promise: null,
  updated: false,
};

/**
 * get current/active user
 */
const getUser = async (): Promise<UserResponse> => {
  const response: UserResponse = await httpCurrentUser.get<UserServerResponse, UserData>({}, (data) => ({
    user: data?.user
      ? {
          countryCode: data.user.countryCode,
          email: data.user.email,
          emailNotificationsEnabled: data.user.emailNotificationsEnabled,
          firstName: data.user.firstName,
          globalRoles: data.user.globalRoles,
          id: data.user.id,
          lastName: data.user.lastName,
          locale: data.user.locale,
          timeZone: data.user.timeZone,
        }
      : undefined,
  }));

  if (response.user) {
    CachedUserService.setUser(response.user);
  }

  return response;
};

/**
 * update current/active user
 */
const updateUser = async (user: User, options: UpdateOptions = {}): Promise<Response> => {
  const entity: UpdateUserPayloadType = {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    timeZone: user.timeZone,
    locale: user.locale,
    countryCode: user.countryCode,
  };
  if (user.emailNotificationsEnabled !== undefined) {
    entity.emailNotificationsEnabled = user.emailNotificationsEnabled;
  }
  const response: Response = await httpCurrentUser.put({ entity });
  getUser();
  if (user.timeZone && !options.skipAcknowledgeTimeZone) {
    await PreferencesService.updateUserPreferences({ timeZoneAcknowledgedOnMs: Date.now() });
  }
  return response;
};

/**
 * Delete current user
 */
const deleteUser = async (): Promise<Response> => await httpCurrentUser.delete({});

/**
 * initialize user time zone
 */
const initializeTimeZone = async (user: User, timeZone: string): Promise<InitializedTimeZone> => {
  const { timeZoneAcknowledgedOnMs } = CachedUserService.getUserPreferences();

  const initializedTimeZone: InitializedTimeZone = {
    timeZoneAcknowledgedOnMs,
  };

  if (!user.timeZone) {
    const response = await updateUser({ ...user, timeZone }, { skipAcknowledgeTimeZone: true });
    if (response.requestSucceeded) {
      initializedTimeZone.updated = true;
      initializedTimeZone.timeZone = timeZone;
      cachedTimeZone.updated = true;
    }
  } else {
    initializedTimeZone.timeZone = user.timeZone;
    cachedTimeZone.updated = false;
  }

  return initializedTimeZone;
};

/**
 * return a cached promise for initialized time zone
 * this avoids executing it twice
 */
const getInitializedTimeZone = (user: User, timeZone: string): Promise<InitializedTimeZone> => {
  if (cachedTimeZone.promise) {
    // clear the promise if this was cached before user acknowledged the time zone
    const { timeZoneAcknowledgedOnMs } = CachedUserService.getUserPreferences();
    if (
      (!isNaN(timeZoneAcknowledgedOnMs) && timeZoneAcknowledgedOnMs > cachedTimeZone.cachedOn) ||
      cachedTimeZone.updated
    ) {
      cachedTimeZone.promise = null;
    }
  }
  if (!cachedTimeZone.promise) {
    cachedTimeZone.promise = initializeTimeZone(user, timeZone);
    cachedTimeZone.cachedOn = Date.now();
  }
  return cachedTimeZone.promise;
};

/**
 * initialize preferred units (if not already set)
 */
const initializeUnits = async (units: string): Promise<InitializedUnits> => {
  const { unitsAcknowledgedOnMs, preferredWeightSystem } = CachedUserService.getUserPreferences();

  const initializedUnits: InitializedUnits = {
    unitsAcknowledgedOnMs,
  };

  if (!preferredWeightSystem) {
    const response = await PreferencesService.updateUserPreferences({ preferredWeightSystem: units });
    if (response.requestSucceeded) {
      initializedUnits.updated = true;
      initializedUnits.units = units;
    }
  } else {
    initializedUnits.units = preferredWeightSystem;
  }

  return initializedUnits;
};

/**
 * Exported functions
 */
const UserService = {
  getInitializedTimeZone,
  getUser,
  initializeTimeZone,
  initializeUnits,
  updateUser,
  deleteUser,
};

export default UserService;
