import { paths } from 'src/api/types/generated-schema';
import {
  CreatePlantingSiteRequestPayload,
  PlantingSiteZone,
  Population,
  ValidatePlantingSiteResponsePayload,
} from 'src/types/PlantingSite';
import {
  SearchNodePayload,
  SearchRequestPayload,
  SearchRequestPayloadWithOptionalSearch,
  SearchResponseElement,
  SearchSortOrder,
} from 'src/types/Search';
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
const PLANTING_SITE_T0_ALL_SET_ENDPOINT = '/api/v1/tracking/t0/site/{plantingSiteId}/allSet';

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

export type GetAllSiteT0DataSetResponsePayload =
  paths[typeof PLANTING_SITE_T0_ALL_SET_ENDPOINT]['get']['responses'][200]['content']['application/json'];

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
  return await SearchService.search({
    prefix: 'plantingZones',
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
  });
};

/**
 * Get total plants in planting site
 */
const getTotalPlantsInSite = async (organizationId: number, siteId: number): Promise<Population[] | null> => {
  return (await SearchService.search({
    prefix: 'plantingSitePopulations',
    fields: ['species_scientificName', 'totalPlants(raw)'],
    search: getSearchNode(organizationId, siteId),
    count: 0,
  })) as unknown as Population[] | null;
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

const getPlotsWithObservations = async <T extends SearchResponseElement>(
  plantingSiteId: number
): Promise<T[] | null> => {
  const params: SearchRequestPayloadWithOptionalSearch = {
    prefix: 'monitoringPlots',
    fields: [
      'id',
      'name',
      'plantingSubzone_name',
      'plantingSubzone_plantingZone_name',
      'plantingSubzone_plantingZone_id',
      'observationPlots.observation_id',
      'observationPlots.observation_startDate',
      'observationPlots.observation_completedTime',
      'observationPlots.isPermanent',
      'permanentIndex',
    ],
    search: {
      operation: 'and',
      children: [
        {
          operation: 'field',
          field: 'plantingSite_id',
          type: 'Exact',
          values: [plantingSiteId],
        },
        {
          operation: 'not',
          child: {
            operation: 'field',
            field: 'plantingSubzone_id',
            type: 'Exact',
            values: [null],
          },
        },
        {
          operation: 'field',
          field: 'observationPlots.observation_state',
          type: 'Exact',
          values: ['Completed', 'Abandoned'],
        },
      ],
    },
    filters: [
      {
        prefix: 'observationPlots',
        search: {
          operation: 'field',
          field: 'observation_state',
          type: 'Exact',
          values: ['Completed', 'Abandoned'],
        },
      },
    ],
    count: 1000,
  };

  return SearchService.search<T>(params);
};

const getT0AllSet = async (plantingSiteId: number): Promise<Response2<GetAllSiteT0DataSetResponsePayload>> => {
  return HttpService.root(
    PLANTING_SITE_T0_ALL_SET_ENDPOINT.replace('{plantingSiteId}', plantingSiteId.toString())
  ).get2<GetAllSiteT0DataSetResponsePayload>();
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
  getTotalPlantsInSite,
  getTotalPlantsInZones,
  listPlantingSites,
  reassignPlantings,
  searchMonitoringPlots,
  searchPlantingSites,
  getPlantingSiteHistory,
  listPlantingSiteHistories,
  listOrganizationReportedPlants,
  getPlotsWithObservations,
  getT0AllSet,
};

export default TrackingService;
