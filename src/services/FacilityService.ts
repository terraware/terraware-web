import { Facility, FacilityType } from 'src/types/Facility';
import { Organization } from 'src/types/Organization';
import { OrNodePayload, SearchRequestPayload } from 'src/types/Search';
import { getAllNurseries, getAllSeedBanks } from 'src/utils/organization';
import { parseSearchTerm } from 'src/utils/search';

import SearchService from './SearchService';

/**
 * Service for facility related functionality
 */

/**
 * Types exported from service
 */
type Facilities = Facility[];

type FacilitySearchParams = {
  type: FacilityType;
  organizationId: number | string;
  query?: string;
};

type GetFacilityRequest = {
  organization: Organization;
  facilityId: number | string;
  type: FacilityType;
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
 * Search facilities by parameters
 */
const getFacilities = async ({ type, organizationId, query }: FacilitySearchParams): Promise<Facilities> => {
  const searchField: OrNodePayload | null = query
    ? (() => {
        const { type: searchType, values } = parseSearchTerm(query);
        return {
          operation: 'or',
          children: [
            {
              operation: 'field',
              field: 'name',
              searchType,
              values,
            },
            {
              operation: 'field',
              field: 'description',
              searchType,
              values,
            },
          ],
        };
      })()
    : null;

  const params: SearchRequestPayload = {
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
        { operation: 'field', field: 'type(raw)', type: 'Exact', values: [type] },
        {
          operation: 'field',
          field: 'organization_id',
          type: 'Exact',
          values: [organizationId.toString()],
        },
        ...(searchField ? [searchField] : []),
      ],
    },
    count: 0,
  };

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
  facilityBuildStartedDateValid,
  facilityBuildCompletedDateValid,
  facilityOperationStartedDateValid,
};

export default FacilityService;
