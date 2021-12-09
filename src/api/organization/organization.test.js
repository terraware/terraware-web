/* tslint:disable:no-console */
import { OrgRequestError, exportedForTesting, getOrganizations } from './organization';
import axios from 'axios';

const getLayers = exportedForTesting.getLayers;

jest.mock('axios');

const ORGANIZATIONS = [
  {
    id: 1,
    name: 'Terraformation (staging)',
    role: 'Owner',
    projects: [
      {
        id: 0,
        name: 'Example Project',
        sites: [
          {
            id: 10,
            name: 'Example Site',
            projectId: 10,
            facilities: [
              {
                id: 100,
                name: 'ohana',
                type: 'Seed Bank',
              },
              {
                id: 101,
                name: 'garage',
                type: 'Seed Bank',
              },
            ],
          },
        ],
      },
    ],
  },
];

const SUCCESSFUL_GET_ORGANIZATIONS_RESPONSE = { data: { organizations: ORGANIZATIONS, status: 'ok' } };

const PROJECTS = [
  {
    id: 1,
    name: 'Hawaii Project',
  },
  {
    id: 2,
    name: 'Oahu Project',
  },
];
const SUCCESSFUL_GET_PROJECTS_RESPONSE = { data: { projects: PROJECTS, status: 'ok' } };
const EMPTY_GET_PROJECTS_RESPONSE = { data: { projects: [], status: 'ok' } };

const SITES = [
  {
    id: 10,
    projectId: 1,
  },
  {
    id: 20,
    projectId: 2,
  },
];
const SUCCESSFUL_GET_SITES_RESPONSE = { data: { sites: SITES, status: 'ok' } };
const EMPTY_GET_SITES_RESPONSE = { data: { sites: [], status: 'ok' } };

const FACILITIES = [
  {
    id: 100,
    siteId: 20,
  },
];
// Server response includes facility type, which is used by getSeedBankFacilities() to select only Seed Bank facilities.
const FACILITIES_FROM_SERVER = FACILITIES.map((facility) => {
  return { ...facility, type: 'Seed Bank' };
});
const SUCCESSFUL_GET_FACILITIES_RESPONSE = { data: { facilities: FACILITIES_FROM_SERVER, status: 'ok' } };

const LAYERS = [
  {
    id: 100,
    siteId: 20,
  },
];
// Server response includes layer type, which is used by getPlantLayers() to select only Plants Planted layers.
const LAYERS_FROM_SERVER = LAYERS.map((layer) => {
  return { ...layer, layerType: 'Plants Planted' };
});
const SUCCESSFUL_GET_LAYERS_RESPONSE = { data: { layers: LAYERS_FROM_SERVER, status: 'ok' } };
const EMPTY_GET_LAYERS_RESPONSE = { data: { layers: [], status: 'ok' } };

const FAILURE_RESPONSE = { request: { status: 500 } };

function assertOrganizationIsEmpty(organization) {
  expect(
    Object.keys(organization)
      .map((key) => organization[key])
      .flat()
  ).toEqual([]);
}

test('getOrganizations() returns all data when no errors thrown', async () => {
  axios.get.mockImplementation((url) => {
    if (url.includes('organizations')) {
      return Promise.resolve(SUCCESSFUL_GET_ORGANIZATIONS_RESPONSE);
    }
  });
  await expect(getOrganizations()).resolves.toEqual({
    organizations: ORGANIZATIONS,
    requestSucceeded: true,
  });
});

async function testProjectsOrSitesEmpty(emptyResponse) {
  expect(emptyResponse === 'projects' || emptyResponse === 'sites').toBe(true);

  axios.get.mockImplementation((url) => {
    if (url.includes('projects')) {
      return Promise.resolve(
        emptyResponse === 'projects' ? EMPTY_GET_PROJECTS_RESPONSE : SUCCESSFUL_GET_PROJECTS_RESPONSE
      );
    } else if (url.includes('sites')) {
      return Promise.resolve(emptyResponse === 'sites' ? EMPTY_GET_SITES_RESPONSE : SUCCESSFUL_GET_SITES_RESPONSE);
    }

    console.error('Axios mock called with an unexpected url');
    throw Error('Axios mock called with an unexpected url');
  });

  const response = await getOrganization();
  expect(response.errors).toEqual([
    emptyResponse === 'projects' ? OrgRequestError.NoProjects : OrgRequestError.NoSites,
  ]);
  if (emptyResponse === 'projects') {
    assertOrganizationIsEmpty(response.organization);
  } else {
    expect(response.organization.projects).toEqual(PROJECTS);
    expect(response.organization.sites).toEqual([]);
  }
}

test('getOrganization() returns partial data and correct errors on failure to fetch layers and facilities', () => {
  testFacilitiesAndOrLayersFailure('both');
});

async function testFacilitiesAndOrLayersFailure(failure) {
  expect(failure === 'facilities' || failure === 'layers' || failure === 'both').toBe(true);

  const shouldFacilitiesFail = () => {
    return failure === 'facilities' || failure === 'both';
  };
  const shouldLayersFail = () => {
    return failure === 'layers' || failure === 'both';
  };

  axios.get.mockImplementation((url) => {
    if (url.includes('projects')) {
      return Promise.resolve(SUCCESSFUL_GET_PROJECTS_RESPONSE);
    }
    if (url.includes('sites')) {
      return Promise.resolve(SUCCESSFUL_GET_SITES_RESPONSE);
    }
    if (url.includes('facility')) {
      return shouldFacilitiesFail()
        ? Promise.reject(FAILURE_RESPONSE)
        : Promise.resolve(SUCCESSFUL_GET_FACILITIES_RESPONSE);
    }
    if (url.includes('gis/layers/list/20')) {
      return shouldLayersFail() ? Promise.reject(FAILURE_RESPONSE) : Promise.resolve(SUCCESSFUL_GET_LAYERS_RESPONSE);
    } else if (url.includes('gis/layers/list/10')) {
      return shouldLayersFail() ? Promise.reject(FAILURE_RESPONSE) : Promise.resolve(EMPTY_GET_LAYERS_RESPONSE);
    }

    console.error('Axios mock called with an unexpected url');
    throw Error('Axios mock called with an unexpected url');
  });

  const expectedErrors = [];
  if (shouldFacilitiesFail()) {
    expectedErrors.push(OrgRequestError.ErrorFetchingFacilities);
  }
  if (shouldLayersFail()) {
    expectedErrors.push(OrgRequestError.ErrorFetchingLayers);
  }

  const response = await getOrganization();
  expect(response.errors).toEqual(expectedErrors);
  expect(response.organization).toEqual({
    projects: PROJECTS,
    sites: SITES,
    facilities: shouldFacilitiesFail() ? [] : FACILITIES,
    plantLayers: shouldLayersFail() ? [] : LAYERS,
  });
}

test('getLayers() returns a rejected promise if fetching layers from any site fails', async () => {
  axios.get.mockImplementation((url) => {
    if (url.includes('gis/layers/list/20')) {
      return Promise.resolve(SUCCESSFUL_GET_LAYERS_RESPONSE);
    } else if (url.includes('gis/layers/list/10')) {
      return Promise.reject(FAILURE_RESPONSE);
    }

    console.error('Axios mock called with an unexpected url');
    throw Error('Axios mock called with an unexpected url');
  });

  await expect(getLayers(SITES)).rejects.toEqual(FAILURE_RESPONSE);
});
