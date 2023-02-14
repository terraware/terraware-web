import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from './HttpService';
import { Delivery, PlantingSite } from 'src/types/Tracking';

/**
 * Tracking related services
 */

const PLANTING_SITES_ENDPOINT = '/api/v1/tracking/sites';
const PLANTING_SITE_ENDPOINT = '/api/v1/tracking/sites/{id}';
const DELIVERY_ENDPOINT = '/api/v1/tracking/deliveries/{id}';
const REASSIGN_ENDPOINT = '/api/v1/tracking/deliveries/{id}/reassign';

type ListPlantingSitesResponsePayload =
  paths[typeof PLANTING_SITES_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type GetPlantingSiteResponsePayload =
  paths[typeof PLANTING_SITE_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type GetDeliveryResponsePayload =
  paths[typeof DELIVERY_ENDPOINT]['get']['responses'][200]['content']['application/json'];

/**
 * exported type
 */
export type PlantingSitesData = {
  sites?: PlantingSite[];
};

export type PlantingSiteData = {
  site?: PlantingSite;
};
export type PlantingSitePostRequestBody =
  paths[typeof PLANTING_SITES_ENDPOINT]['post']['requestBody']['content']['application/json'];

export type PlantingSiteId = {
  id: number;
};

export type DeliveryData = {
  delivery?: Delivery;
};

export type PlantingSitePutRequestBody =
  paths[typeof PLANTING_SITE_ENDPOINT]['put']['requestBody']['content']['application/json'];

export type ReassignPostRequestBody =
  paths[typeof REASSIGN_ENDPOINT]['post']['requestBody']['content']['application/json'];

const httpPlantingSites = HttpService.root(PLANTING_SITES_ENDPOINT);
const httpPlantingSite = HttpService.root(PLANTING_SITE_ENDPOINT);

/**
 * List all planting sites
 */
const listPlantingSites = async (organizationId: number, full?: boolean): Promise<PlantingSitesData & Response> => {
  const response: PlantingSitesData & Response = await httpPlantingSites.get<
    ListPlantingSitesResponsePayload,
    PlantingSitesData
  >(
    {
      params: {
        organizationId: organizationId.toString(),
        full: (full || false).toString(),
      },
    },
    (data) => ({ sites: data?.sites })
  );

  return response;
};

/**
 * Create a planting site
 */
const createPlantingSite = async (plantingSite: PlantingSitePostRequestBody): Promise<PlantingSiteId & Response> => {
  const serverResponse: Response = await httpPlantingSites.post({ entity: plantingSite });

  return {
    ...serverResponse,
    id: serverResponse.data?.id ?? 0,
  };
};

/**
 * Get a planting site by id, also returns associated planting zones -> plots
 */
const getPlantingSite = async (siteId: number): Promise<PlantingSiteData & Response> => {
  const response: PlantingSiteData & Response = await httpPlantingSite.get<
    GetPlantingSiteResponsePayload,
    PlantingSiteData
  >(
    {
      urlReplacements: {
        '{id}': siteId.toString(),
      },
    },
    (data) => ({ site: data?.site })
  );

  return response;
};

/**
 * Update a planting site
 */
const updatePlantingSite = async (siteId: number, plantingSite: PlantingSitePutRequestBody): Promise<Response> => {
  return await httpPlantingSite.put({
    urlReplacements: {
      '{id}': siteId.toString(),
    },
    entity: plantingSite,
  });
};

/**
 * Get a delivery by id
 */
const getDelivery = async (deliveryId: number): Promise<DeliveryData & Response> => {
  const response: DeliveryData & Response = await HttpService.root(DELIVERY_ENDPOINT).get<
    GetDeliveryResponsePayload,
    DeliveryData
  >(
    {
      urlReplacements: {
        '{id}': deliveryId.toString(),
      },
    },
    (data) => ({ delivery: data?.delivery })
  );

  return response;
};

/**
 * Reassign plantings
 */
const reassignPlantings = async (deliveryId: number, reassignments: ReassignPostRequestBody): Promise<Response> => {
  return await HttpService.root(REASSIGN_ENDPOINT).post({
    urlReplacements: {
      '{id}': deliveryId.toString(),
    },
    entity: reassignments,
  });
};

/**
 * Exported functions
 */
const TrackingService = {
  listPlantingSites,
  createPlantingSite,
  getPlantingSite,
  updatePlantingSite,
  getDelivery,
  reassignPlantings,
};

export default TrackingService;
