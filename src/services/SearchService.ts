import { paths } from 'src/api/types/generated-schema';
import {
  SearchCriteria,
  SearchNodePayload,
  SearchResponseElement,
  SearchValuesResponseElement,
} from 'src/types/Search';

import HttpService from './HttpService';

/**
 * Service for user related functionality
 */

// endpoint
const SEARCH_ENDPOINT = '/api/v1/search';
const SEARCH_VALUES_ENDPOINT = '/api/v1/search/values';

/*
 * Types exported from service
 */

/**
 * Payload of search request as it's defined in the OpenAPI schema.
 *
 * This is called RawSearchRequestPayload to distinguish it from SearchRequestPayload as defined
 * in Search.ts. SearchRequestPayload is stricter: it requires a search filter, whereas the API
 * doesn't. We almost always want to include a search filter, so we generally use the stricter
 * type to catch cases where it's missing.
 *
 * You will generally want SearchRequestPayload instead of this.
 */
export type RawSearchRequestPayload =
  paths[typeof SEARCH_ENDPOINT]['post']['requestBody']['content']['application/json'];

export type SearchResponsePayload =
  paths[typeof SEARCH_ENDPOINT]['post']['responses'][200]['content']['application/json'];

export type RawSearchValuesRequestPayload =
  paths[typeof SEARCH_VALUES_ENDPOINT]['post']['requestBody']['content']['application/json'];

export type SearchValuesResponsePayload =
  paths[typeof SEARCH_VALUES_ENDPOINT]['post']['responses'][200]['content']['application/json'];

const httpSearch = HttpService.root(SEARCH_ENDPOINT);
const httpSearchValues = HttpService.root(SEARCH_VALUES_ENDPOINT);

/**
 * Converts a list of search criteria to an AndNodePayload that includes a filter for
 * organization ID.
 *
 * @param criteria Search criteria in the type of SearchCriteria, which is used by the application,
 *   or an array of SearchNodePayload
 * @param organizationId ID of organization to search.
 * @return SearchNodePayload suitable for use in a search request. This will currently always be
 *   an AndNodePayload.
 */
function convertToSearchNodePayload(
  criteria: SearchCriteria | SearchNodePayload[],
  organizationId: number
): SearchNodePayload {
  const newCriteria = Object.values(criteria);
  newCriteria.unshift({
    field: 'facility_organization_id',
    values: [organizationId.toString()],
    operation: 'field',
  } as SearchNodePayload);
  return {
    operation: 'and',
    children: newCriteria,
  };
}

async function search<T extends SearchResponseElement>(entity: RawSearchRequestPayload): Promise<T[] | null> {
  try {
    const response: SearchResponsePayload = (await httpSearch.post({ entity })).data;
    return response.results as T[] | null;
  } catch {
    return null;
  }
}

async function searchValues<T extends SearchValuesResponseElement>(
  entity: RawSearchValuesRequestPayload
): Promise<T | null> {
  try {
    const response: SearchValuesResponsePayload = (await httpSearchValues.post({ entity })).data;
    return response.results as T | null;
  } catch {
    return null;
  }
}

async function searchCsv(entity: RawSearchRequestPayload): Promise<any> {
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
  searchValues,
  searchCsv,
};

export default SearchService;
