import { setHttpServiceMocks, clearHttpServiceMocks } from './HttpServiceMocks';
import CachedUserService from '../CachedUserService';
import PreferencesService from '../PreferencesService';
import { User } from '../../types/User';

const USER = {
  id: 1,
  firstName: 'Constanza',
  email: 'constanza@terraformation.com',
};

const PREFERENCES = {
  lastVisitedOrg: 1,
};

const UPDATED_PREFERENCES = {
  lastVisitedOrg: 2,
};

const ORG_PREFERENCES = {
  lastDashboardPlantingSite: { plantingSiteId: 4 },
};

const UPDATED_ORG_PREFERENCES = {
  lastDashboardPlantingSite: { plantingSiteId: 5 },
};

describe('Cached user service test', () => {
  beforeEach(() => {
    clearHttpServiceMocks();
  });

  test('get cached user should return correct user', () => {
    CachedUserService.setUser(USER as User);

    const cachedUser = CachedUserService.getUser();

    expect(cachedUser).toEqual({ ...USER, isTerraformation: true });
  });

  test('get cached user preferences should return correct preferences', async () => {
    setHttpServiceMocks({
      get: () =>
        Promise.resolve({
          preferences: PREFERENCES,
          requestSucceeded: true,
          statusCode: 200,
        }),
    });

    const { preferences } = await PreferencesService.getUserPreferences();

    const cachedPreferences = CachedUserService.getUserPreferences();

    expect(cachedPreferences).toEqual(preferences);
  });

  test('get cached org preferences should return correct org preferences', async () => {
    setHttpServiceMocks({
      get: () =>
        Promise.resolve({
          preferences: ORG_PREFERENCES,
          requestSucceeded: true,
          statusCode: 200,
        }),
    });

    const { preferences } = await PreferencesService.getUserOrgPreferences(1);

    const cachedOrgPreferences = CachedUserService.getUserOrgPreferences(1);

    expect(cachedOrgPreferences).toEqual(preferences);
  });

  test('user preferences should be updated', async () => {
    setHttpServiceMocks({
      put: () =>
        Promise.resolve({
          requestSucceeded: true,
          statusCode: 200,
        }),
      get: () =>
        Promise.resolve({
          preferences: UPDATED_PREFERENCES,
          requestSucceeded: true,
          statusCode: 200,
        }),
    });

    await PreferencesService.updateUserPreferences(UPDATED_PREFERENCES);

    const cachedPreferences = CachedUserService.getUserPreferences();

    expect(cachedPreferences).toEqual(UPDATED_PREFERENCES);
  });

  test('org preferences should be updated', async () => {
    setHttpServiceMocks({
      put: () =>
        Promise.resolve({
          requestSucceeded: true,
          statusCode: 200,
        }),
      get: () =>
        Promise.resolve({
          user: UPDATED_ORG_PREFERENCES,
          requestSucceeded: true,
          statusCode: 200,
        }),
    });

    await PreferencesService.updateUserOrgPreferences(1, UPDATED_ORG_PREFERENCES);

    const cachedOrgPreferences = CachedUserService.getUserOrgPreferences(1);

    expect(cachedOrgPreferences).toEqual(UPDATED_ORG_PREFERENCES);
  });
});
