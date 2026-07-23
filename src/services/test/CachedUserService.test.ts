import CachedUserService from '../CachedUserService';
import { User } from '../../types/User';

const USER = {
  id: 1,
  firstName: 'Constanza',
  email: 'constanza@terraformation.com',
};

const PREFERENCES = {
  lastVisitedOrg: 1,
};

const ORG_PREFERENCES = {
  lastDashboardPlantingSite: { plantingSiteId: 4 },
};

describe('Cached user service test', () => {
  test('get cached user should return correct user', () => {
    CachedUserService.setUser(USER as User);

    const cachedUser = CachedUserService.getUser();

    expect(cachedUser).toEqual({ ...USER, isTerraformation: true });
  });

  test('get cached user preferences should return the preferences that were set', () => {
    CachedUserService.setUserPreferences(PREFERENCES);

    expect(CachedUserService.getUserPreferences()).toEqual(PREFERENCES);
  });

  test('get cached org preferences should return the org preferences that were set', () => {
    CachedUserService.setUserOrgPreferences(1, ORG_PREFERENCES);

    expect(CachedUserService.getUserOrgPreferences(1)).toEqual(ORG_PREFERENCES);
  });

  test('cookie consent preference should merge into the cached global preferences', () => {
    CachedUserService.setUserPreferences(PREFERENCES);
    CachedUserService.setUserCookieConsentPreferences(true);

    expect(CachedUserService.getUserPreferences()).toEqual({ ...PREFERENCES, cookiesConsented: true });
  });
});
