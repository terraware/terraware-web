import { User } from 'src/types/User';

import { PreferencesType } from './DataTypes';

/**
 * Synchronous, module-level snapshot of the current user and global preferences, mirrored from
 * UserProvider's latched state.
 *
 * This exists for synchronous, non-React readers (feature flags in `src/features.ts`) that cannot
 * consume the UserProvider context and must survive the `RESET_APP` store wipe OrganizationProvider
 * dispatches on org change. Because it is fed by UserProvider's latched state (not the RTK Query
 * cache, which the wipe clears), it stays valid across org changes.
 */

let currentUser: User | undefined;
let globalPreferences: PreferencesType | undefined;

export const setCurrentUserSnapshot = (user: User | undefined): void => {
  currentUser = user;
};

export const getCurrentUserSnapshot = (): User | undefined => currentUser;

export const setGlobalPreferencesSnapshot = (preferences: PreferencesType | undefined): void => {
  globalPreferences = preferences;
};

export const getGlobalPreferencesSnapshot = (): PreferencesType | undefined => globalPreferences;
