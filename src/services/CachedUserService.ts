import { User } from 'src/types/User';
import { isTerraformationEmail } from 'src/utils/user';

/**
 * Cached current user and preferences.
 * TODO: move this to redux
 */

let currentUser: any = {};
const userPreferences: any = {};

// set current user
const setUser = (user: User) => {
  const { email } = user;
  currentUser = {
    ...user,
    isTerraformation: isTerraformationEmail(email),
  };
};

// set current user preferences
const setUserPreferences = (preferences: Record<string, any>) => {
  userPreferences.global = { ...preferences };
};

// set current user org preferences
const setUserOrgPreferences = (organizationId: number, preferences: Record<string, any>) => {
  userPreferences[organizationId.toString()] = { ...preferences };
};

// get current user
const getUser = () => ({ ...currentUser });

// get current user preferences
const getUserPreferences = (): Record<string, any> => ({ ...(userPreferences.global || {}) });

// get current user org preferences
const getUserOrgPreferences = (organizationId: number): Record<string, any> => ({
  ...(userPreferences[organizationId.toString()] || {}),
});

/**
 * Exported functions
 */
const CachedUserService = {
  getUser,
  getUserPreferences,
  getUserOrgPreferences,
  setUser,
  setUserPreferences,
  setUserOrgPreferences,
};

export default CachedUserService;
