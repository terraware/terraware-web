import { paths } from 'src/api/types/generated-schema';
import {
  CreatePlantingSiteRequestPayload,
  PlantingSiteZone,
  Population,
  ValidatePlantingSiteResponsePayload,
} from 'src/types/PlantingSite';
import { SearchNodePayload, SearchRequestPayload, SearchSortOrder } from 'src/types/Search';
import { Delivery, MonitoringPlotSearchResult, PlantingSite, PlantingSiteSearchResult } from 'src/types/Tracking';

import { isArray } from '../types/utils';
import HttpService, { Response, Response2 } from './HttpService';
import SearchService from './SearchService';

/**
 * Tracking related services
 */

const PLANTING_SITES_ENDPOINT = '/api/v1/tracking/sites';
const PLANTING_SITES_VALIDATE_ENDPOINT = '/api/v1/tracking/sites/validate';
const PLANTING_SITE_ENDPOINT = '/api/v1/tracking/sites/{id}';
const DELIVERY_ENDPOINT = '/api/v1/tracking/deliveries/{id}';
const REASSIGN_ENDPOINT = '/api/v1/tracking/deliveries/{id}/reassign';
const PLANTING_SITE_REPORTED_PLANTS_ENDPOINT = '/api/v1/tracking/sites/{id}/reportedPlants';
const PLANTING_SITE_HISTORY_ENDPOINT = '/api/v1/tracking/sites/{id}/history/{historyId}';
const PLANTING_SITE_HISTORIES_ENDPOINT = '/api/v1/tracking/sites/{id}/history';
const ALL_REPORTED_PLANTS_ENDPOINT = '/api/v1/tracking/sites/reportedPlants';

type ListPlantingSitesResponsePayload =
  paths[typeof PLANTING_SITES_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type GetPlantingSiteResponsePayload =
  paths[typeof PLANTING_SITE_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type GetDeliveryResponsePayload =
  paths[typeof DELIVERY_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type GetPlantingSiteReportedPlantsPayload =
  paths[typeof PLANTING_SITE_REPORTED_PLANTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type ListOrganizationReportedPlantsPayload =
  paths[typeof ALL_REPORTED_PLANTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type CreatePlantingSiteResponse =
  paths[typeof PLANTING_SITES_ENDPOINT]['post']['responses'][200]['content']['application/json'];

/**
 * exported type
 */
export type PlantingSitesData = {
  sites?: PlantingSite[];
};

export type PlantingSiteData = {
  site?: PlantingSite;
};

export type DeliveryData = {
  delivery?: Delivery;
};

export type ReassignPostRequestBody =
  paths[typeof REASSIGN_ENDPOINT]['post']['requestBody']['content']['application/json'];

export type GetPlantingSiteHistoryPayload =
  paths[typeof PLANTING_SITE_HISTORY_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type ListPlantingSiteHistoriesPayload =
  paths[typeof PLANTING_SITE_HISTORIES_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const httpPlantingSites = HttpService.root(PLANTING_SITES_ENDPOINT);
const httpPlantingSitesValidate = HttpService.root(PLANTING_SITES_VALIDATE_ENDPOINT);
const httpPlantingSite = HttpService.root(PLANTING_SITE_ENDPOINT);

/**
 * List all planting sites
 */
const fetchPlantingSiteList = async (
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
const createPlantingSite = async (
  entity: CreatePlantingSiteRequestPayload
): Promise<Response2<CreatePlantingSiteResponse>> => {
  return httpPlantingSites.post2<CreatePlantingSiteResponse>({ entity });
};

/**
 * Validate a planting site
 */
const validatePlantingSite = async (
  entity: CreatePlantingSiteRequestPayload
): Promise<Response2<ValidatePlantingSiteResponsePayload>> => {
  return httpPlantingSitesValidate.post2<ValidatePlantingSiteResponsePayload>({ entity });
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
 * Get Reported Plants by Planting Site
 */
const getReportedPlants = async (plantingSiteId: number): Promise<Response2<GetPlantingSiteReportedPlantsPayload>> => {
  const response = await HttpService.root(
    PLANTING_SITE_REPORTED_PLANTS_ENDPOINT
  ).get2<GetPlantingSiteReportedPlantsPayload>({
    urlReplacements: {
      '{id}': plantingSiteId.toString(),
    },
  });

  return response;
};

/**
 * List Reported Plants for every Planting Site for an organization
 */
const listOrganizationReportedPlants = async (
  organizationId: number
): Promise<Response2<ListOrganizationReportedPlantsPayload>> => {
  const response = await HttpService.root(ALL_REPORTED_PLANTS_ENDPOINT).get2<ListOrganizationReportedPlantsPayload>({
    params: {
      organizationId: organizationId.toString(),
    },
  });

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

  const additionalSearchNodes: SearchNodePayload[] = [];

  if (searchField) {
    if (isArray(searchField)) {
      for (const field of searchField) {
        additionalSearchNodes.push(field);
      }
    } else {
      additionalSearchNodes.push(searchField);
    }
  }

  const params: SearchRequestPayload = {
    fields: [
      'boundary',
      'description',
      'id',
      'name',
      'numPlantingSubzones',
      'numPlantingSubzones(raw)',
      'numPlantingZones',
      'numPlantingZones(raw)',
      'project_name',
      'project_id',
      'timeZone',
      'totalPlants(raw)',
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
        ...additionalSearchNodes,
      ],
    },
    count: 0,
  };

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
    fields: ['id', 'plotNumber'],
    prefix: 'monitoringPlots',
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

const getPlantingSiteHistory = async (
  plantingSiteId: number,
  historyId: number
): Promise<Response2<GetPlantingSiteHistoryPayload>> => {
  return HttpService.root(
    PLANTING_SITE_HISTORY_ENDPOINT.replace('{id}', plantingSiteId.toString()).replace(
      '{historyId}',
      historyId.toString()
    )
  ).get2<GetPlantingSiteHistoryPayload>();
};

/**
 * List all planting sites
 */
const listPlantingSites = async (request: {
  projectId?: number;
  organizationId?: number;
  full?: boolean;
}): Promise<Response2<ListPlantingSitesResponsePayload>> => {
  return await httpPlantingSites.get2<ListPlantingSitesResponsePayload>({
    params: {
      ...(request.projectId !== undefined && { projectId: request.projectId.toString() }),
      ...(request.organizationId !== undefined && { organizationId: request.organizationId.toString() }),
      full: (request?.full || false).toString(),
    },
  });
};

const listPlantingSiteHistories = async (
  plantingSiteId: number
): Promise<Response2<ListPlantingSiteHistoriesPayload>> => {
  return HttpService.root(
    PLANTING_SITE_HISTORIES_ENDPOINT.replace('{id}', plantingSiteId.toString())
  ).get2<ListPlantingSiteHistoriesPayload>();
};

/**
 * Exported functions
 */
const TrackingService = {
  createPlantingSite,
  fetchPlantingSiteList,
  validatePlantingSite,
  getDelivery,
  getPlantingSite,
  getReportedPlants,
  listPlantingSites,
  reassignPlantings,
  searchMonitoringPlots,
  searchPlantingSites,
  getPlantingSiteHistory,
  listPlantingSiteHistories,
  listOrganizationReportedPlants,
};

export default TrackingService;
