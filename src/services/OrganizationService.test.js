/* tslint:disable:no-console */
import { OrganizationService } from './OrganizationService';
import axios from 'axios';

jest.mock('axios');

const ORGANIZATIONS = [
  {
    id: 1,
    name: 'Terraformation (staging)',
    role: 'Owner',
  },
];

const SUCCESSFUL_GET_ORGANIZATIONS_RESPONSE = { data: { organizations: ORGANIZATIONS, status: 'ok' } };

const FAILURE_RESPONSE = { request: { status: 500 } };

test('getOrganizations() returns all data when no errors thrown', async () => {
  axios.get.mockImplementation((url) => {
    if (url.includes('organizations')) {
      return Promise.resolve(SUCCESSFUL_GET_ORGANIZATIONS_RESPONSE);
    }
  });
  await expect(OrganizationService.getOrganizations()).resolves.toEqual({
    organizations: ORGANIZATIONS,
    error: null,
  });
});

test('getOrganizations() fails', async () => {
  axios.get.mockImplementation((url) => {
    if (url.includes('organizations')) {
      return Promise.reject(FAILURE_RESPONSE);
    }
  });
  await expect(OrganizationService.getOrganizations()).resolves.toEqual({
    organizations: [],
    error: 'GenericError',
  });
});
