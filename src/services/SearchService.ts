import { paths } from 'src/api/types/generated-schema';
import { SearchNodePayload, SearchCriteria, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import HttpService from './HttpService';
import { PlantingSiteSearchResult } from 'src/types/Tracking';

/**
 * Service for user related functionality
 */

// endpoint
const SEARCH_ENDPOINT = '/api/v1/search';

/**
 * Types exported from service
 */

export type SearchRequestPayload = paths[typeof SEARCH_ENDPOINT]['post']['requestBody']['content']['application/json'];
export type SearchResponsePayload =
  paths[typeof SEARCH_ENDPOINT]['post']['responses'][200]['content']['application/json'];

const httpSearch = HttpService.root(SEARCH_ENDPOINT);

/*
 * convertToSearchNodePayload()
 * input: search criteria in the type of SearchCriteria, which is used by the application
 * output: search criteria in the type of SearchNodePayload, which is required by API modules.
 *         undefined if the input represented no search criteria.
 */
function convertToSearchNodePayload(criteria: SearchCriteria, organizationId?: number): SearchNodePayload | undefined {
  if (Object.keys(criteria).length === 0 && !organizationId) {
    return undefined;
  }
  let newCriteria = criteria;
  if (organizationId) {
    newCriteria = addOrgInfoToSearch(organizationId, criteria);
  }
  return {
    operation: 'and',
    children: Object.values(newCriteria),
  };
}

function addOrgInfoToSearch(organizationId: number, previousCriteria?: SearchCriteria) {
  const newCriteria = previousCriteria ? Object.values(previousCriteria) : [];
  newCriteria.unshift({
    field: 'facility_organization_id',
    values: [organizationId.toString()],
    operation: 'field',
  });

  return newCriteria;
}

async function search(entity: SearchRequestPayload): Promise<SearchResponseElement[] | null> {
  try {
    const response: SearchResponsePayload = (await httpSearch.post({ entity })).data;
    return response.results;
  } catch {
    return null;
  }
}

type SearchFieldType = {
  operation: string;
  children: {
    operation: string;
    field: string;
    type: string;
    values: string[];
  }[];
};

async function searchPlantingSites(
  organizationId: number,
  searchField?: SearchFieldType,
  sortOrder?: SearchSortOrder
): Promise<PlantingSiteSearchResult[] | null> {
  const defaultSortOder = {
    field: 'name',
    direction: 'Ascending',
  } as SearchSortOrder;

  const params = {
    fields: [
      'boundary',
      'id',
      'name',
      'numPlantingZones',
      'numPlantingSubzones',
      'description',
      'timeZone',
      'totalPlants(raw)',
    ],
    prefix: 'plantingSites',
    sortOrder: [sortOrder || defaultSortOder],
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
    const children: any = params.search.children;
    children.push(searchField);
  }

  return (await search(params)) as PlantingSiteSearchResult[];
}

async function searchCsv(entity: SearchRequestPayload): Promise<any> {
  const headers = {
    accept: 'text/csv',
  };
  try {
    const response = (await httpSearch.post({ entity, headers })).data;
    return response;
  } catch {
    return null;
  }
}

/**
 * Exported functions
 */
const SearchService = {
  convertToSearchNodePayload,
  search,
  searchCsv,
  searchPlantingSites,
};

export default SearchService;
