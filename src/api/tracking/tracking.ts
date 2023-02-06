import axios from 'axios';
import addQueryParams from 'src/api/helpers/addQueryParams';
import { paths } from '../types/generated-schema';
import { addError } from '../utils';
import { PlantingSite } from 'src/types/Tracking';

/**
 * Planting sites - create / list
 */

const PLANTING_SITES_ENDPOINT = '/api/v1/tracking/sites';

/**
 * List all planting sites
 */

type ListPlantingSitesResponsePayload =
  paths[typeof PLANTING_SITES_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type ListPlantingSitesResponse = {
  requestSucceeded: boolean;
  sites?: PlantingSite[];
  error?: string;
};

export const listPlantingSites = async (organizationId: number, full?: boolean): Promise<ListPlantingSitesResponse> => {
  const response: ListPlantingSitesResponse = {
    requestSucceeded: true,
  };

  try {
    const endpoint = addQueryParams(PLANTING_SITES_ENDPOINT, { organizationId, full: full || false });
    const serverResponse: ListPlantingSitesResponsePayload = (await axios.get(endpoint)).data;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
      addError(serverResponse, response);
    } else {
      response.sites = serverResponse.sites;
    }
  } catch (e: any) {
    response.requestSucceeded = false;
    addError(e?.response?.data || {}, response);
  }

  return response;
};

/**
 * Create a new planting site
 */

type PlantingSitePostResponse =
  paths[typeof PLANTING_SITES_ENDPOINT]['post']['responses'][200]['content']['application/json'];

export type PlantingSitePostRequestBody =
  paths[typeof PLANTING_SITES_ENDPOINT]['post']['requestBody']['content']['application/json'];

type CreatePlantingSiteResponse = {
  requestSucceeded: boolean;
  id: number;
  error?: string;
};

export const postPlantingSite = async (
  plantingSite: PlantingSitePostRequestBody
): Promise<CreatePlantingSiteResponse> => {
  const response: CreatePlantingSiteResponse = {
    requestSucceeded: true,
    id: 0,
  };

  try {
    const serverResponse: PlantingSitePostResponse = (await axios.post(PLANTING_SITES_ENDPOINT, plantingSite)).data;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
      addError(serverResponse, response);
    } else {
      response.id = serverResponse.id;
    }
  } catch (e: any) {
    response.requestSucceeded = false;
    addError(e?.response?.data || {}, response);
  }

  return response;
};

/**
 * Planting Site - get / update
 */

const PLANTING_SITE_ENDPOINT = '/api/v1/tracking/sites/{id}';

/**
 * Get a planting site by id, also returns associated planting zones -> plots
 */

type GetPlantingSiteResponsePayload =
  paths[typeof PLANTING_SITE_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type PlantingSiteResponse = {
  requestSucceeded: boolean;
  site?: PlantingSite;
  error?: string;
};

export const getPlantingSite = async (siteId: number): Promise<PlantingSiteResponse> => {
  const response: PlantingSiteResponse = {
    requestSucceeded: true,
  };

  try {
    const endpoint = PLANTING_SITE_ENDPOINT.replace('{id}', siteId.toString());
    const serverResponse: GetPlantingSiteResponsePayload = (await axios.get(endpoint)).data;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
      addError(serverResponse, response);
    } else {
      response.site = serverResponse.site;
    }
  } catch (e: any) {
    response.requestSucceeded = false;
    addError(e?.response?.data || {}, response);
  }

  return response;
};

/**
 * Update a planting site
 */

type PlantingSitePutResponse =
  paths[typeof PLANTING_SITE_ENDPOINT]['put']['responses'][200]['content']['application/json'];

export type PlantingSitePutRequestBody =
  paths[typeof PLANTING_SITE_ENDPOINT]['put']['requestBody']['content']['application/json'];

type UpdatePlantingSiteResponse = {
  requestSucceeded: boolean;
  error?: string;
};

export const updatePlantingSite = async (
  siteId: number,
  plantingSite: PlantingSitePutRequestBody
): Promise<UpdatePlantingSiteResponse> => {
  const response: UpdatePlantingSiteResponse = {
    requestSucceeded: true,
  };

  try {
    const endpoint = PLANTING_SITE_ENDPOINT.replace('{id}', siteId.toString());
    const serverResponse: PlantingSitePutResponse = (await axios.put(endpoint, plantingSite)).data;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
      addError(serverResponse, response);
    }
  } catch (e: any) {
    response.requestSucceeded = false;
    addError(e?.response?.data || {}, response);
  }

  return response;
};
