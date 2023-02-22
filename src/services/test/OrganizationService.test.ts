import { setHttpServiceMocks, clearHttpServiceMocks } from './HttpServiceMocks';
import OrganizationService from '../OrganizationService';

const ORGANIZATIONS = [
  {
    id: 1,
    name: 'Terraformation (staging)',
    role: 'Owner',
  },
];

describe('Organization service', () => {
  beforeEach(() => {
    clearHttpServiceMocks();
  });

  test('getOrganizations() returns all data when no errors thrown', async () => {
    setHttpServiceMocks({
      get: () =>
        Promise.resolve({
          organizations: ORGANIZATIONS,
          requestSucceeded: true,
          statusCode: 200,
        }),
    });

    const { organizations, requestSucceeded } = await OrganizationService.getOrganizations();

    expect({ organizations, requestSucceeded }).toEqual({
      organizations: ORGANIZATIONS,
      requestSucceeded: true,
    });
  });

  test('getOrganizations() fails', async () => {
    setHttpServiceMocks({
      get: () =>
        Promise.resolve({
          organizations: [],
          requestSucceeded: false,
          statusCode: 500,
        }),
    });

    const { organizations, error, requestSucceeded } = await OrganizationService.getOrganizations();

    expect({ organizations, error, requestSucceeded }).toEqual({
      organizations: [],
      error: 'GenericError',
      requestSucceeded: false,
    });
  });
});
