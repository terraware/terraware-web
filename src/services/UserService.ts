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
};

// endpoint
const CURRENT_USER_ENDPOINT = '/api/v1/users/me';

type UserServerResponse = paths[typeof CURRENT_USER_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type UpdateUserPayloadType = paths[typeof CURRENT_USER_ENDPOINT]['put']['requestBody']['content']['application/json'];

const httpCurrentUser = HttpService.root(CURRENT_USER_ENDPOINT);

const cachedTimeZone: CachedTimeZone = {
  cachedOn: 0,
  promise: null,
};

/**
 * get current/active user
 */
const getUser = async (): Promise<UserResponse> => {
  const response: UserResponse = await httpCurrentUser.get<UserServerResponse, UserData>({}, (data) => ({
    user: data?.user
      ? {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          emailNotificationsEnabled: data.user.emailNotificationsEnabled,
          timeZone: data.user.timeZone,
          locale: data.user.locale,
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
 * initialize user time zone
 */
const initializeTimeZone = async (user: User, timeZone: string): Promise<InitializedTimeZone> => {
  const { timeZoneAcknowledgedOnMs, timeZoneNotificationCreatedMs } = CachedUserService.getUserPreferences();

  const initializedTimeZone: InitializedTimeZone = {
    timeZoneAcknowledgedOnMs,
    timeZoneNotificationCreatedMs,
  };

  if (!user.timeZone) {
    const response = await updateUser({ ...user, timeZone }, { skipAcknowledgeTimeZone: true });
    if (response.requestSucceeded) {
      initializedTimeZone.updated = true;
      initializedTimeZone.timeZone = timeZone;
    }
  } else {
    initializedTimeZone.timeZone = user.timeZone;
  }

  if (!timeZoneNotificationCreatedMs) {
    const response = await PreferencesService.updateUserPreferences({ timeZoneNotificationCreatedMs: Date.now() });
    if (response.requestSucceeded) {
      initializedTimeZone.timeZoneNotificationCreatedMs = Date.now();
    }
  } else {
    initializedTimeZone.timeZoneNotificationCreatedMs = timeZoneNotificationCreatedMs;
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
    if (!isNaN(timeZoneAcknowledgedOnMs) && timeZoneAcknowledgedOnMs > cachedTimeZone.cachedOn) {
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
  const { unitsAcknowledgedOnMs, preferredWeightSystem, unitsNotificationCreatedMs } =
    CachedUserService.getUserPreferences();

  const initializedUnits: InitializedUnits = {
    unitsAcknowledgedOnMs,
    unitsNotificationCreatedMs,
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

  if (!unitsNotificationCreatedMs) {
    const response = await PreferencesService.updateUserPreferences({ unitsNotificationCreatedMs: Date.now() });
    if (response.requestSucceeded) {
      initializedUnits.unitsNotificationCreatedMs = Date.now();
    }
  } else {
    initializedUnits.unitsNotificationCreatedMs = unitsNotificationCreatedMs;
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
};

export default UserService;
