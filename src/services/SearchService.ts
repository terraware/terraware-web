import { SearchApiArg, SearchApiResponse } from 'src/queries/generated/search';
import { SearchResponseElement } from 'src/types/Search';

import HttpService from './HttpService';

/**
 * Service for user related functionality
 */

// endpoint
const SEARCH_ENDPOINT = '/api/v1/search';

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
type RawSearchRequestPayload = SearchApiArg;

type SearchResponsePayload = SearchApiResponse;

const httpSearch = HttpService.root(SEARCH_ENDPOINT);

async function search<T extends SearchResponseElement>(
  entity: RawSearchRequestPayload,
  headers?: Record<string, string>
): Promise<T[] | null> {
  try {
    const response: SearchResponsePayload = (await httpSearch.post({ entity, headers })).data;
    return response.results as T[] | null;
  } catch {
    return null;
  }
}

/**
 * Exported functions
 */
const SearchService = {
  search,
};

export default SearchService;
