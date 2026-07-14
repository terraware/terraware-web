import { paths } from 'src/api/types/generated-schema';
import { InitializedTimeZone } from 'src/types/TimeZones';
import { User } from 'src/types/User';
import { InitializedUnits } from 'src/units';

import CachedUserService from './CachedUserService';
import HttpService, { Response } from './HttpService';
import PreferencesService from './PreferencesService';

/**
 * Service for user related functionality
 */

/**
 * Types exported from service
 */
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

type UpdateUserPayloadType = paths[typeof CURRENT_USER_ENDPOINT]['put']['requestBody']['content']['application/json'];

const httpCurrentUser = HttpService.root(CURRENT_USER_ENDPOINT);

const cachedTimeZone: CachedTimeZone = {
  cachedOn: 0,
  promise: null,
  updated: false,
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
  if (response.requestSucceeded && typeof user.cookiesConsented === 'boolean') {
    await PreferencesService.updateUserCookieConsentPreferences({ cookiesConsented: user.cookiesConsented });
  }

  if (user.timeZone && !options.skipAcknowledgeTimeZone) {
    await PreferencesService.updateUserPreferences({ timeZoneAcknowledgedOnMs: Date.now() });
  }

  return response;
};

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
  initializeTimeZone,
  initializeUnits,
  updateUser,
};

export default UserService;
