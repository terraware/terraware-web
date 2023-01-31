import { Facility, FacilityType } from 'src/api/types/facilities';
import SearchService, { SearchNodePayload } from './SearchService';

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

/**
 * Search facilities by parameters
 */
const getFacilities = async ({ type, organizationId, query }: FacilitySearchParams): Promise<Facilities> => {
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
    fields: ['id', 'name', 'description', 'type', 'organization_id', 'timeZone'],
    search: {
      operation: 'and',
      children: [
        { operation: 'field', field: 'type', type: 'Exact', values: [type] },
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
      };
    }) ?? [];

  return facilities;
};

/**
 * Exported functions
 */
const FacilityService = {
  getFacilities,
};

export default FacilityService;
