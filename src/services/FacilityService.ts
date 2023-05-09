import strings from 'src/strings';
import { paths } from 'src/api/types/generated-schema';
import { Organization } from 'src/types/Organization';
import { Facility, FacilityType } from 'src/types/Facility';
import { SearchNodePayload } from 'src/types/Search';
import SearchService from './SearchService';
import HttpService, { Response } from './HttpService';
import { getAllSeedBanks, getAllNurseries } from 'src/utils/organization';

/**
 * Service for facility related functionality
 */

/**
 * Types exported from service
 */
export type Facilities = Facility[];

export type FacilitySearchParams = {
  type: FacilityType;
  organizationId: number | string;
  query?: string;
};

export type GetFacilityRequest = {
  organization: Organization;
  facilityId: number | string;
  type: FacilityType;
};

export type CreateFacilityResponse = Response & {
  facilityId: number | null;
};

const FACILITIES_ENDPOINT = '/api/v1/facilities';
const FACILITY_ENDPOINT = '/api/v1/facilities/{facilityId}';

type CreateFacilityRequestPayload =
  paths[typeof FACILITIES_ENDPOINT]['post']['requestBody']['content']['application/json'];
type UpdateFacilityRequestPayload =
  paths[typeof FACILITY_ENDPOINT]['put']['requestBody']['content']['application/json'];

type StorageLocations = {
  storageLocationNames?: string[];
};

const httpFacilities = HttpService.root(FACILITIES_ENDPOINT);
const httpFacility = HttpService.root(FACILITY_ENDPOINT);

/**
 * create a facility
 */
const createFacility = async (facility: Omit<Facility, 'id'> & StorageLocations): Promise<CreateFacilityResponse> => {
  const entity: CreateFacilityRequestPayload = {
    name: facility.name,
    description: facility.description,
    organizationId: facility.organizationId,
    type: facility.type,
    timeZone: facility.timeZone,
    storageLocationNames: facility.storageLocationNames,
    buildStartedDate: facility.buildStartedDate,
    buildCompletedDate: facility.buildCompletedDate,
    operationStartedDate: facility.operationStartedDate,
    capacity: facility.capacity,
  };

  const serverResponse: Response = await httpFacilities.post({ entity });

  const response: CreateFacilityResponse = {
    ...serverResponse,
    facilityId: serverResponse.data?.id ?? null,
  };

  return response;
};

/**
 * get facility
 */
const getFacility = ({ organization, facilityId, type }: GetFacilityRequest): Facility | undefined => {
  if (type === 'Nursery') {
    return getAllNurseries(organization).find((n) => n?.id.toString() === facilityId.toString());
  } else if (type === 'Seed Bank') {
    return getAllSeedBanks(organization).find((n) => n?.id.toString() === facilityId.toString());
  }
};

/**
 * Update a facility
 */
const updateFacility = async (facility: Facility): Promise<Response> => {
  const entity: UpdateFacilityRequestPayload = {
    name: facility.name,
    description: facility.description,
    timeZone: facility.timeZone,
    buildStartedDate: facility.buildStartedDate,
    buildCompletedDate: facility.buildCompletedDate,
    operationStartedDate: facility.operationStartedDate,
    capacity: facility.capacity,
  };

  return await httpFacility.put({
    entity,
    urlReplacements: {
      '{facilityId}': facility.id.toString(),
    },
  });
};

/**
 * Search facilities by parameters
 */
const getFacilities = async ({ type, organizationId, query }: FacilitySearchParams): Promise<Facilities> => {
  const typeVal = type === 'Seed Bank' ? strings.SEED_BANK : strings.NURSERY;
  const searchField = query
    ? {
        operation: 'or',
        children: [
          { operation: 'field', field: 'name', type: 'Fuzzy', values: [query] },
          { operation: 'field', field: 'description', type: 'Fuzzy', values: [query] },
        ],
      }
    : null;

  const params: SearchNodePayload = {
    prefix: 'facilities',
    fields: [
      'id',
      'name',
      'description',
      'type',
      'organization_id',
      'timeZone',
      'buildStartedDate',
      'buildCompletedDate',
      'operationStartedDate',
      'capacity',
    ],
    search: {
      operation: 'and',
      children: [
        { operation: 'field', field: 'type', type: 'Exact', values: [typeVal] },
        {
          operation: 'field',
          field: 'organization_id',
          type: 'Exact',
          values: [organizationId.toString()],
        },
      ],
    },
    count: 0,
  };

  if (searchField) {
    params.search.children.push(searchField);
  }

  const searchResults = await SearchService.search(params);
  const facilities: Facility[] =
    searchResults?.map((result) => {
      return {
        id: result.id as number,
        name: result.name as string,
        description: result.description as string,
        organizationId: parseInt(result.organization_id as string, 10),
        type: result.type as FacilityType,
        connectionState: result.connectionState as 'Not Connected' | 'Connected' | 'Configured',
        timeZone: result.timeZone as string,
        buildStartedDate: result.buildStartedDate as string,
        buildCompletedDate: result.buildCompletedDate as string,
        operationStartedDate: result.operationStartedDate as string,
        capacity: result.capacity as number,
      };
    }) ?? [];

  return facilities;
};

/** Return true by default since we don't require setting the field in the facility view */
const facilityBuildStartedDateValid = (
  buildStart: string | undefined,
  buildComplete: string | undefined,
  opStart: string | undefined
) => {
  let beforeBuildCompletedConditionMet = true;
  let beforeOpStartedConditionMet = true;
  if (buildStart && buildComplete) {
    beforeBuildCompletedConditionMet = Date.parse(buildStart) <= Date.parse(buildComplete);
  }
  if (buildStart && opStart) {
    beforeOpStartedConditionMet = Date.parse(buildStart) <= Date.parse(opStart);
  }
  return beforeBuildCompletedConditionMet && beforeOpStartedConditionMet;
};

/** Return true by default since we don't require setting the field in the facility view */
const facilityBuildCompletedDateValid = (
  buildStart: string | undefined,
  buildComplete: string | undefined,
  opStart: string | undefined
) => {
  let afterStartConditionMet = true;
  let beforeOpStartedConditionMet = true;
  if (buildStart && buildComplete) {
    afterStartConditionMet = Date.parse(buildStart) <= Date.parse(buildComplete);
  }
  if (buildComplete && opStart) {
    beforeOpStartedConditionMet = Date.parse(buildComplete) <= Date.parse(opStart);
  }
  return afterStartConditionMet && beforeOpStartedConditionMet;
};

/** Return true by default since we don't require setting the field in the facility view */
const facilityOperationStartedDateValid = (
  buildStart: string | undefined,
  buildComplete: string | undefined,
  opStart: string | undefined
) => {
  let afterBuildStartedConditionMet = true;
  let afterBuildCompletedConditionMet = true;
  if (buildStart && opStart) {
    afterBuildStartedConditionMet = Date.parse(buildStart) <= Date.parse(opStart);
  }
  if (buildComplete && opStart) {
    afterBuildCompletedConditionMet = Date.parse(buildComplete) <= Date.parse(opStart);
  }
  return afterBuildStartedConditionMet && afterBuildCompletedConditionMet;
};

/**
 * Exported functions
 */
const FacilityService = {
  getFacilities,
  getFacility,
  createFacility,
  updateFacility,
  facilityBuildStartedDateValid,
  facilityBuildCompletedDateValid,
  facilityOperationStartedDateValid,
};

export default FacilityService;
