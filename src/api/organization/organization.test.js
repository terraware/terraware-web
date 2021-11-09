import getOrganization, {OrgRequestError, exportedForTesting} from "./organization";
import axios from "axios";

const getLayers = exportedForTesting.getLayers

jest.mock('axios');

const PROJECTS =  [
  {
    id: 1,
    name: "Hawaii Project",
  },
  {
    id: 2,
    name: "Oahu Project",
  }
]
const SUCCESSFUL_GET_PROJECTS_RESPONSE = { data: { projects: PROJECTS, status: 'ok'}};
const EMPTY_GET_PROJECTS_RESPONSE = { data: { projects: [], status: 'ok'}};

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
const SUCCESSFUL_GET_SITES_RESPONSE = { data: { sites: SITES, status: 'ok'}};
const EMPTY_GET_SITES_RESPONSE = { data: { sites: [], status: 'ok'}};

const FACILITIES = [
  {
    id: 100,
    siteId: 20,
  }
]
// Server response includes facility type, which is used by getSeedBankFacilities() to select only Seed Bank facilities.
const FACILITIES_FROM_SERVER = FACILITIES.map(facility => {
  return {...facility, type: 'Seed Bank'}
});
const SUCCESSFUL_GET_FACILITIES_RESPONSE = { data: { facilities: FACILITIES_FROM_SERVER, status: 'ok'}};

const LAYERS = [
  {
    id: 100,
    siteId: 20,
  },
]
// Server response includes layer type, which is used by getPlantLayers() to select only Plants Planted layers.
const LAYERS_FROM_SERVER = LAYERS.map(layer => {
  return {...layer, layerType: 'Plants Planted'}
});
const SUCCESSFUL_GET_LAYERS_RESPONSE = { data: { layers: LAYERS_FROM_SERVER, status: 'ok'}};
const EMPTY_GET_LAYERS_RESPONSE = { data: { layers: [], status: 'ok'}};

const FAILURE_RESPONSE = {request : { status: 500 }};

function assertOrganizationIsEmpty(organization) {
  expect(Object.keys(organization).map(key => organization[key]).flat()).toEqual([]);
}

test('getOrganization() returns all data when no errors thrown', async () => {
  axios.get.mockImplementation((url) => {
    if (url.includes('projects')) {
      return Promise.resolve(SUCCESSFUL_GET_PROJECTS_RESPONSE);
    }
    if (url.includes('sites')) {
      return Promise.resolve(SUCCESSFUL_GET_SITES_RESPONSE);
    }
    if (url.includes('facility')) {
      return Promise.resolve(SUCCESSFUL_GET_FACILITIES_RESPONSE);
    }
    if (url.includes('gis/layers/list/20')) {
      return Promise.resolve(SUCCESSFUL_GET_LAYERS_RESPONSE);
    } else if (url.includes('gis/layers/list/10')) {
      return Promise.resolve(EMPTY_GET_LAYERS_RESPONSE);
    }

    console.error('Axios mock called with an unexpected url');
    throw Error('Axios mock called with an unexpected url');
  });

  await expect(getOrganization()).resolves.toEqual({
    organization: {
      projects: PROJECTS,
      sites: SITES,
      facilities: FACILITIES,
      layers: LAYERS,
    },
    errors: [],
  });
});

test('getOrganization() returns error (and no org data) when project list is empty', async () => {
  await testProjectsOrSitesEmpty('projects');
});

test('getOrganization() returns project list and correct error when site list is empty', async () => {
  await testProjectsOrSitesEmpty('sites');
});

async function testProjectsOrSitesEmpty(emptyResponse) {
  expect(emptyResponse === 'projects' || emptyResponse === 'sites').toBe(true);

  axios.get.mockImplementation((url) => {
    if (url.includes('projects')) {
      return Promise.resolve(emptyResponse === 'projects' ? EMPTY_GET_PROJECTS_RESPONSE : SUCCESSFUL_GET_PROJECTS_RESPONSE);
    } else if(url.includes('sites')) {
      return Promise.resolve(emptyResponse === 'sites' ? EMPTY_GET_SITES_RESPONSE : SUCCESSFUL_GET_SITES_RESPONSE);
    }

    console.error('Axios mock called with an unexpected url');
    throw Error('Axios mock called with an unexpected url');
  });

  const response = await getOrganization();
  expect(response.errors).toEqual(
      [emptyResponse === 'projects' ? OrgRequestError.NoProjects : OrgRequestError.NoSites]
  );
  if (emptyResponse === 'projects') {
    assertOrganizationIsEmpty(response.organization);
  } else {
    expect(response.organization.projects).toEqual(PROJECTS);
    expect(response.organization.sites).toEqual([]);
  }
}

test('getOrganization() returns error (and no org data) on failure to fetch projects', async () => {
  await testProjectsOrSitesFailure('projects');
});

test('getOrganization() returns error (and no org data) on failure to fetch sites', async () => {
  await testProjectsOrSitesFailure('sites');
});

async function testProjectsOrSitesFailure(failure) {
  expect(failure === 'projects' || failure === 'sites').toBe(true);

  // suppress console.error() calls so that the expected errors don't look like test failures
  jest.spyOn(console, 'error').mockImplementation(() => {/* tslint:disable:no-empty */});

  axios.get.mockImplementation((url) => {
    if (url.includes('projects')) {
      return failure === 'projects'
          ? Promise.reject(FAILURE_RESPONSE)
          : Promise.resolve(SUCCESSFUL_GET_PROJECTS_RESPONSE);
    } else if(url.includes('sites')) {
      return failure === 'sites'
          ? Promise.reject(FAILURE_RESPONSE)
          : Promise.resolve(SUCCESSFUL_GET_SITES_RESPONSE);
    }

    console.error('Axios mock called with an unexpected url');
    throw Error('Axios mock called with an unexpected url');
  });

  const response = await getOrganization();
  expect(response.errors).toEqual([OrgRequestError.ErrorFetchingProjectsOrSites]);
  assertOrganizationIsEmpty(response.organization);
}

test('getOrganization() returns partial data and correct error on failure to fetch facilities', () => {
  testFacilitiesAndOrLayersFailure('facilities');
});

test('getOrganization() returns partial data and correct error on failure to fetch layers', () => {
  testFacilitiesAndOrLayersFailure('layers');
});

test('getOrganization() returns partial data and correct errors on failure to fetch layers and facilities', () => {
  testFacilitiesAndOrLayersFailure('both');
});

async function testFacilitiesAndOrLayersFailure(failure) {
  expect(failure === 'facilities' || failure === 'layers' || failure === 'both').toBe(true);

  const shouldFacilitiesFail = () => {
    return failure === 'facilities' || failure === 'both';
  }
  const shouldLayersFail = () => {
    return failure === 'layers' || failure === 'both';
  }

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
      return shouldLayersFail()
          ? Promise.reject(FAILURE_RESPONSE)
          : Promise.resolve(SUCCESSFUL_GET_LAYERS_RESPONSE);
    } else if (url.includes('gis/layers/list/10')) {
      return shouldLayersFail()
          ? Promise.reject(FAILURE_RESPONSE)
          : Promise.resolve(EMPTY_GET_LAYERS_RESPONSE);
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
    layers: shouldLayersFail() ? [] : LAYERS,
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
