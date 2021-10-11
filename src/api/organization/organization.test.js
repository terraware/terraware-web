import getOrganization, {OrgRequestError, exportedForTesting} from "./organization";
import axios from "axios";

const getLayers = exportedForTesting.getLayers

jest.mock('axios');

const PROJECTS =  [
  {
    id: 1,
    name: "Kauai Project",
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
    type: 'seed bank',
  }
]

const SUCCESSFUL_GET_FACILITIES_RESPONSE = { data: { facilities: FACILITIES, status: 'ok'}};

const LAYERS = [
  {
    id: 100,
    siteId: 20,
    layerType: 'Plants Planted',
  }
]

const SUCCESSFUL_GET_LAYERS_RESPONSE = { data: { layers: LAYERS, status: 'ok'}};
const EMPTY_GET_LAYERS_RESPONSE = { data: { layers: [], status: 'ok'}};

const FAILURE_RESPONSE = {request : { status: 500 }};


test('getOrganization() returns all data when no errors thrown', async () => {

  axios.get.mockImplementation((url) => {
    if (url.includes('/api/v1/projects')) {
      return Promise.resolve(SUCCESSFUL_GET_PROJECTS_RESPONSE)
    }
    if (url.includes('/api/v1/sites')) {
      return Promise.resolve(SUCCESSFUL_GET_SITES_RESPONSE)
    }
    if (url.includes('/api/v1/facility')) {
      return Promise.resolve(SUCCESSFUL_GET_FACILITIES_RESPONSE)
    }
    if (url.includes('/api/v1/gis/layers/list/20')) {
      return Promise.resolve(SUCCESSFUL_GET_LAYERS_RESPONSE)
    } else if (url.includes('/api/v1/gis/layers/list/10')) {
      return Promise.resolve(EMPTY_GET_LAYERS_RESPONSE)
    }
  });

  await expect(getOrganization()).resolves.toEqual({
    organization: {
      projects: PROJECTS,
      sites: SITES,
      facilities: FACILITIES,
      layers: LAYERS,
    },
    error: null
  })
});

async function testProjectsOrSitesEmpty(makeEmpty) {
  expect(makeEmpty === 'projects' || makeEmpty === 'sites').toBe(true)

  axios.get.mockImplementation((url) => {
    if (url.includes('/api/v1/projects')) {
      return Promise.resolve(makeEmpty === 'projects' ? EMPTY_GET_PROJECTS_RESPONSE : SUCCESSFUL_GET_PROJECTS_RESPONSE)
    } else if(url.includes('/api/v1/sites')) {
      return Promise.resolve(makeEmpty === 'sites' ? EMPTY_GET_SITES_RESPONSE : SUCCESSFUL_GET_SITES_RESPONSE)
    }
  });
  const response = await getOrganization();
  expect(response.error).toEqual(
      makeEmpty === 'projects' ? OrgRequestError.NoProjects : OrgRequestError.NoSites
  )
}


test('getOrganization() returns error when project list is empty', () => {
  testProjectsOrSitesEmpty('projects')
});

test('getOrganization() returns error when site list is empty', () => {
  testProjectsOrSitesEmpty('sites')
});

async function testProjectsOrSitesFailure(failure) {
  expect(failure === 'projects' || failure === 'sites').toBe(true)

  // suppress console.error() calls so that the expected errors don't look like test failures
  jest.spyOn(console, 'error').mockImplementation(() => {/* tslint:disable:no-empty */});

  axios.get.mockImplementation((url) => {
    if (url.includes('/api/v1/projects')) {
      return failure === 'projects' ? Promise.reject(FAILURE_RESPONSE)
                                    : Promise.resolve(SUCCESSFUL_GET_PROJECTS_RESPONSE)
    } else if(url.includes('/api/v1/sites')) {
      return failure === 'sites' ? Promise.reject(FAILURE_RESPONSE)
                                 : Promise.resolve(SUCCESSFUL_GET_SITES_RESPONSE)
    }
  });
  const response = await getOrganization();
  expect(response.error).toEqual(OrgRequestError.AxiosError)
}

test('getOrganization() returns error on axios failure to fetch projects', () => {
  testProjectsOrSitesFailure('projects');
});

test('getOrganization() returns error on axios failure to fetch sites', () => {
  testProjectsOrSitesFailure('sites');
});

async function testFacilitiesAndOrLayersFailure(failure) {
  expect(failure === 'facilities' || failure === 'layers' || failure === 'both').toBe(true)

  const shouldFacilitiesFail = () => {
    return failure === 'facilities' || failure === 'both'
  }

  const shouldLayersFail = () => {
    return failure === 'layers' || failure === 'both'
  }

  axios.get.mockImplementation((url) => {
    if (url.includes('/api/v1/projects')) {
      return Promise.resolve(SUCCESSFUL_GET_PROJECTS_RESPONSE)
    }
    if (url.includes('/api/v1/sites')) {
      return Promise.resolve(SUCCESSFUL_GET_SITES_RESPONSE)
    }
    if (url.includes('/api/v1/facility')) {
      return shouldFacilitiesFail() ? Promise.reject(FAILURE_RESPONSE)
                                    : Promise.resolve(SUCCESSFUL_GET_FACILITIES_RESPONSE)
    }
    if (url.includes('/api/v1/gis/layers/list/20')) {
      return shouldLayersFail() ? Promise.reject(FAILURE_RESPONSE)
                                : Promise.resolve(SUCCESSFUL_GET_LAYERS_RESPONSE)
    } else if (url.includes('/api/v1/gis/layers/list/10')) {
      return shouldLayersFail() ? Promise.reject(FAILURE_RESPONSE)
                                : Promise.resolve(EMPTY_GET_LAYERS_RESPONSE)
    }
  });

  const response = await getOrganization();
  expect(response.error).toEqual(null);
  expect(response.organization).toEqual({
    projects: PROJECTS,
    sites: SITES,
    facilities: shouldFacilitiesFail() ? [] : FACILITIES,
    layers: shouldLayersFail() ? [] : LAYERS,

  });
}

test('getOrganization() does not return error on failure to fetch facilities', () => {
  testFacilitiesAndOrLayersFailure('facilities')
});

test('getOrganization() does not return error on failure to fetch layers', () => {
  testFacilitiesAndOrLayersFailure('layers')
});

test('getOrganization() does not return error on failure to fetch both layers and facilities', () => {
  testFacilitiesAndOrLayersFailure('both')
});

test('getLayers() returns a rejected promise if fetching layers from any site fails', async () => {
  axios.get.mockImplementation((url) => {
    if (url.includes('/api/v1/gis/layers/list/20')) {
      return Promise.resolve(SUCCESSFUL_GET_LAYERS_RESPONSE)
    } else if (url.includes('/api/v1/gis/layers/list/10')) {
      return Promise.reject(FAILURE_RESPONSE)
    }
  });

  await expect(getLayers(SITES)).rejects.toEqual(FAILURE_RESPONSE)
});
