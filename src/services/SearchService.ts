import { paths, components } from 'src/api/types/generated-schema';
import HttpService from './HttpService';

/**
 * Service for user related functionality
 */

// endpoint
const SEARCH_ENDPOINT = '/api/v1/search';

/**
 * Types exported from service
 */

export type AndNodePayload = components['schemas']['AndNodePayload'] & { operation: 'and' };
export type FieldNodePayload = components['schemas']['FieldNodePayload'] & { operation: 'field' };
export type NotNodePayload = components['schemas']['NotNodePayload'] & { operation: 'not' };
export type OrNodePayload = components['schemas']['OrNodePayload'] & { operation: 'or' };
export type SearchNodePayload = AndNodePayload | FieldNodePayload | NotNodePayload | OrNodePayload;
export type FieldValuesPayload = { [key: string]: components['schemas']['FieldValuesPayload'] };
export type SearchCriteria = Record<string, SearchNodePayload>;
export type SearchSortOrder = components['schemas']['SearchSortOrderElement'];
export type SearchRequestPayload = paths[typeof SEARCH_ENDPOINT]['post']['requestBody']['content']['application/json'];
export type SearchResponsePayload =
  paths[typeof SEARCH_ENDPOINT]['post']['responses'][200]['content']['application/json'];
export type SearchResponseElement = SearchResponsePayload['results'][0];

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
};

export default SearchService;
