import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from './HttpService';
import { Delivery, PlantingSite, PlantingSiteReportedPlants } from 'src/types/Tracking';
import { PlantingSiteZone, Population } from 'src/types/PlantingSite';
import SearchService from './SearchService';
import { SearchNodePayload, SearchRequestPayload, SearchSortOrder } from 'src/types/Search';
import { MonitoringPlotSearchResult, PlantingSiteSearchResult } from 'src/types/Tracking';
import { isArray } from '../types/utils';

/**
 * Tracking related services
 */

const PLANTING_SITES_ENDPOINT = '/api/v1/tracking/sites';
const PLANTING_SITE_ENDPOINT = '/api/v1/tracking/sites/{id}';
const DELIVERY_ENDPOINT = '/api/v1/tracking/deliveries/{id}';
const REASSIGN_ENDPOINT = '/api/v1/tracking/deliveries/{id}/reassign';
const REPORTED_PLANTS_ENDPOINT = '/api/v1/tracking/sites/{id}/reportedPlants';

type ListPlantingSitesResponsePayload =
  paths[typeof PLANTING_SITES_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type GetPlantingSiteResponsePayload =
  paths[typeof PLANTING_SITE_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type GetDeliveryResponsePayload =
  paths[typeof DELIVERY_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type PlantingSiteReportedPlantsPayload =
  paths[typeof REPORTED_PLANTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

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

export type SiteReportedPlantsData = {
  site?: PlantingSiteReportedPlants;
};

const httpPlantingSites = HttpService.root(PLANTING_SITES_ENDPOINT);
const httpPlantingSite = HttpService.root(PLANTING_SITE_ENDPOINT);

/**
 * List all planting sites
 */
const listPlantingSites = async (
  organizationId: number,
  full?: boolean,
  locale?: string | null
): Promise<PlantingSitesData & Response> => {
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
    (data) => ({
      sites: data?.sites.sort((a, b) => a.name.localeCompare(b.name, locale || undefined)),
    })
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
 * Get a planting site by id, also returns associated planting zones -> planting subzones
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
 * Delete a planting site by id
 */
const deletePlantingSite = async (siteId: number): Promise<Response> => {
  return await httpPlantingSite.delete({
    urlReplacements: {
      '{id}': siteId.toString(),
    },
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

// helper to get search criteria
const getSearchNode = (organizationId: number, siteId: number): SearchNodePayload => ({
  children: [
    {
      operation: 'field',
      field: 'plantingSite_id',
      values: [siteId.toString()],
    },
    {
      operation: 'field',
      field: 'plantingSite_organization_id',
      values: [organizationId.toString()],
    },
  ],
  operation: 'and',
});

/**
 * Get planting zone total plants
 */
const getTotalPlantsInZones = async (organizationId: number, siteId: number): Promise<PlantingSiteZone[] | null> => {
  return (await SearchService.search({
    prefix: 'plantingSites.plantingZones',
    fields: [
      'plantingSubzones.id',
      'plantingSubzones.fullName',
      'plantingSubzones.populations.species_scientificName',
      'plantingSubzones.populations.species_organization_id',
      'plantingSubzones.populations.totalPlants(raw)',
      'plantingSubzones.populations.totalPlants',
      'id',
      'name',
    ],
    search: getSearchNode(organizationId, siteId),
    count: 0,
  })) as PlantingSiteZone[] | null;
};

/**
 * Get total plants in planting site
 */
const getTotalPlantsInSite = async (organizationId: number, siteId: number): Promise<Population[] | null> => {
  return (await SearchService.search({
    prefix: 'plantingSites.populations',
    fields: ['species_scientificName', 'totalPlants(raw)'],
    search: getSearchNode(organizationId, siteId),
    count: 0,
  })) as unknown as Population[] | null;
};

/**
 * Get Reported Plants by Planting Site
 */
const getReportedPlants = async (plantingSiteId: number): Promise<SiteReportedPlantsData & Response> => {
  const response: SiteReportedPlantsData & Response = await HttpService.root(REPORTED_PLANTS_ENDPOINT).get<
    PlantingSiteReportedPlantsPayload,
    SiteReportedPlantsData
  >(
    {
      urlReplacements: {
        '{id}': plantingSiteId.toString(),
      },
    },
    (data) => ({ site: data?.site })
  );

  return response;
};

/**
 * Search planting sites
 */
async function searchPlantingSites(
  organizationId: number,
  searchField?: SearchNodePayload | SearchNodePayload[],
  sortOrder?: SearchSortOrder
): Promise<PlantingSiteSearchResult[] | null> {
  const defaultSortOrder = {
    field: 'name',
    direction: 'Ascending',
  } as SearchSortOrder;

  const params: SearchRequestPayload = {
    fields: [
      'boundary',
      'id',
      'name',
      'numPlantingZones',
      'numPlantingSubzones',
      'description',
      'timeZone',
      'totalPlants(raw)',
      'project_name',
    ],
    prefix: 'plantingSites',
    sortOrder: [sortOrder || defaultSortOrder],
    search: {
      operation: 'and',
      children: [
        {
          field: 'organization_id',
          operation: 'field',
          values: [organizationId],
        },
      ],
    },
    count: 0,
  };

  if (searchField) {
    if (isArray(searchField)) {
      for (const field of searchField) {
        params.search.children.push(field);
      }
    } else {
      params.search.children.push(searchField);
    }
  }

  return (await SearchService.search(params)) as PlantingSiteSearchResult[];
}

/**
 * Search monitoring plots
 */
async function searchMonitoringPlots(
  plantingSiteId: number,
  monitoringPlotIds: number[]
): Promise<MonitoringPlotSearchResult[] | null> {
  const defaultSortOrder = {
    field: 'id',
    direction: 'Ascending',
  } as SearchSortOrder;

  const params: SearchRequestPayload = {
    fields: ['id', 'fullName'],
    prefix: 'plantingSites.plantingZones.plantingSubzones.monitoringPlots',
    sortOrder: [defaultSortOrder],
    search: {
      operation: 'and',
      children: [
        {
          field: 'plantingSubzone_plantingSite_id',
          operation: 'field',
          values: [plantingSiteId],
        },
        {
          field: 'id',
          operation: 'field',
          values: monitoringPlotIds,
        },
      ],
    },
    count: 0,
  };

  return (await SearchService.search(params)) as MonitoringPlotSearchResult[];
}

/**
 * Exported functions
 */
const TrackingService = {
  createPlantingSite,
  deletePlantingSite,
  getDelivery,
  getPlantingSite,
  getReportedPlants,
  getTotalPlantsInSite,
  getTotalPlantsInZones,
  listPlantingSites,
  reassignPlantings,
  searchMonitoringPlots,
  searchPlantingSites,
  updatePlantingSite,
};

export default TrackingService;
