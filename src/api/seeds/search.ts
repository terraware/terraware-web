import axios from '..';
import { paths } from 'src/api/types/generated-schema';
import {
  SearchCriteria,
  SearchRequestPayload,
  SearchResponseElement,
  SearchSortOrder,
  convertToSearchNodePayload,
  search,
} from 'src/api/search';

export const DEFAULT_SEED_SEARCH_FILTERS = {};
export const DEFAULT_SEED_SEARCH_SORT_ORDER = { field: 'receivedDate', direction: 'Descending' } as SearchSortOrder;

export async function getPendingAccessions(organizationId: number): Promise<SearchResponseElement[] | null> {
  const searchParams: SearchRequestPayload = {
    prefix: 'facilities.accessions',
    fields: ['accessionNumber', 'speciesName', 'collectionSiteName', 'collectedDate', 'receivedDate', 'id'],
    search: convertToSearchNodePayload(
      [
        {
          field: 'state',
          values: ['Awaiting Check-In'],
          operation: 'field',
        },
      ],
      organizationId
    ),
    sortOrder: [{ field: 'accessionNumber', direction: 'Ascending' }],
    count: 1000,
  };

  return await search(searchParams);
}

const ALL_FIELD_VALUES_ENDPOINT = '/api/v1/seedbank/values/all';
type ListAllFieldValuesRequestPayload =
  paths[typeof ALL_FIELD_VALUES_ENDPOINT]['post']['requestBody']['content']['application/json'];
type ListAllFieldValuesResponsePayload =
  paths[typeof ALL_FIELD_VALUES_ENDPOINT]['post']['responses'][200]['content']['application/json'];
export type AllFieldValuesMap = ListAllFieldValuesResponsePayload['results'];

/*
 * listAllFieldValues() is a helper function for INTERNAL USE ONLY.
 * DOES NOT DO ANY ERROR HANDLING.
 */
async function listAllFieldValues(
  params: ListAllFieldValuesRequestPayload
): Promise<ListAllFieldValuesResponsePayload> {
  return (await axios.post(ALL_FIELD_VALUES_ENDPOINT, params)).data as ListAllFieldValuesResponsePayload;
}

/*
 * getAllFieldValues() returns all the possible values associated with the requested accession fields.
 * This function does not filter based on which values are currently being used by existing accessions.
 * Returns null if the API request failed.
 *
 * For example, if one of the requested field names was 'stage', this function's return value would
 * include all accession stage options: [dried, drying, in storage, nursery, pending, processed,
 * processing, withdrawn] even if only some stages such as [pending, processed] were being used by
 * existing accessions in the given facility. This example simplifies the input and return type details;
 * see the type definitions for more precise information.
 */
export async function getAllFieldValues(fields: string[], organizationId: number): Promise<AllFieldValuesMap | null> {
  try {
    const params: ListAllFieldValuesRequestPayload = {
      fields,
      organizationId,
    };
    return (await listAllFieldValues(params)).results;
  } catch {
    return null;
  }
}

const FIELD_VALUES_ENDPOINT = '/api/v1/seedbank/values';
type ValuesPostRequestBody = paths[typeof FIELD_VALUES_ENDPOINT]['post']['requestBody']['content']['application/json'];
type ValuesPostResponse = paths[typeof FIELD_VALUES_ENDPOINT]['post']['responses'][200]['content']['application/json'];
export type FieldValuesMap = ValuesPostResponse['results'];

/*
 * searchFieldValues() returns values for the specified fields, given that those values are associated
 * with an accession that match the given search criteria. If no search criteria is specified, the default
 * "search" will be "all accession associated with the given organizationId".
 * Returns null if the API request failed.
 */
export async function searchFieldValues(
  fields: string[],
  searchCriteria: SearchCriteria,
  organizationId: number
): Promise<FieldValuesMap | null> {
  try {
    const formattedSearch = convertToSearchNodePayload(searchCriteria, organizationId);
    const params: ValuesPostRequestBody = {
      fields,
      search: formattedSearch,
    };
    const apiResponse: ValuesPostResponse = (await axios.post(FIELD_VALUES_ENDPOINT, params)).data;
    return apiResponse.results;
  } catch {
    return null;
  }
}

/****************************
 * COLLECTORS SEARCH
 ****************************/

/*
 * Returns all the Collectors associated with a facility, or undefined if the API request failed.
 */
export async function getCollectors(organizationId: number): Promise<string[] | undefined> {
  try {
    const params: ListAllFieldValuesRequestPayload = {
      organizationId,
      fields: ['collectors_name'],
    };

    const collectors = (await listAllFieldValues(params)).results.collectors_name.values;
    return collectors.filter((colector) => colector !== null);
  } catch {
    return undefined;
  }
}
