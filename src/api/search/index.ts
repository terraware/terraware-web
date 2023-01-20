import axios from '..';
import { components, paths } from 'src/api/types/generated-schema';

export type AndNodePayload = components['schemas']['AndNodePayload'] & { operation: 'and' };
export type FieldNodePayload = components['schemas']['FieldNodePayload'] & { operation: 'field' };
export type NotNodePayload = components['schemas']['NotNodePayload'] & { operation: 'not' };
export type OrNodePayload = components['schemas']['OrNodePayload'] & { operation: 'or' };
export type SearchNodePayload = AndNodePayload | FieldNodePayload | NotNodePayload | OrNodePayload;
export type FieldValuesPayload = { [key: string]: components['schemas']['FieldValuesPayload'] };

export type SearchCriteria = Record<string, SearchNodePayload>;
export type SearchSortOrder = components['schemas']['SearchSortOrderElement'];

/*
 * convertToSearchNodePayload()
 * input: search criteria in the type of SearchCriteria, which is used by the application
 * output: search criteria in the type of SearchNodePayload, which is required by API modules.
 *         undefined if the input represented no search criteria.
 */
export function convertToSearchNodePayload(
  criteria: SearchCriteria,
  organizationId?: number
): SearchNodePayload | undefined {
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

const SEARCH_ENDPOINT = '/api/v1/search';
export type SearchRequestPayload = paths[typeof SEARCH_ENDPOINT]['post']['requestBody']['content']['application/json'];
export type SearchResponsePayload =
  paths[typeof SEARCH_ENDPOINT]['post']['responses'][200]['content']['application/json'];
export type SearchResponseElement = SearchResponsePayload['results'][0];

export async function search(params: SearchRequestPayload): Promise<SearchResponseElement[] | null> {
  try {
    const response: SearchResponsePayload = (await axios.post(SEARCH_ENDPOINT, params)).data;
    return response.results;
  } catch {
    return null;
  }
}

export async function searchCsv(params: SearchRequestPayload): Promise<any> {
  const config = {
    headers: {
      accept: 'text/csv',
    },
  };
  try {
    const response = (await axios.post(SEARCH_ENDPOINT, params, config)).data;
    return response;
  } catch {
    return null;
  }
}
