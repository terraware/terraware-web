import axios from '..';
import { components, paths } from 'src/api/types/generated-schema';
import { COLUMNS_INDEXED, DatabaseColumn } from 'src/components/seeds/database/columns';
import { SelectedOrgInfo } from 'src/types/Organization';

export type SeedSearchCriteria = Record<string, SearchNodePayload>;
export const DEFAULT_SEED_SEARCH_FILTERS = {};
export type SeedSearchSortOrder = components['schemas']['SearchSortOrderElement'];
export const DEFAULT_SEED_SEARCH_SORT_ORDER = { field: 'receivedDate', direction: 'Descending' } as SeedSearchSortOrder;

export type AndNodePayload = components['schemas']['AndNodePayload'] & { operation: 'and' };
export type FieldNodePayload = components['schemas']['FieldNodePayload'] & { operation: 'field' };
export type NotNodePayload = components['schemas']['NotNodePayload'] & { operation: 'not' };
export type OrNodePayload = components['schemas']['OrNodePayload'] & { operation: 'or' };
export type SearchNodePayload = AndNodePayload | FieldNodePayload | NotNodePayload | OrNodePayload;
export type FieldValuesPayload = { [key: string]: components['schemas']['FieldValuesPayload'] };

/*
 * convertToSearchNodePayload()
 * input: search criteria in the type of SeedSearchCriteria, which is used by the application
 * output: search criteria in the type of SearchNodePayload, which is required by API modules.
 *         undefined if the input represented no search criteria.
 */
export function convertToSearchNodePayload(
  criteria: SeedSearchCriteria,
  selectedOrgInfo?: SelectedOrgInfo,
  organizationId?: number
): SearchNodePayload | undefined {
  if (criteria === {}) {
    return undefined;
  }
  let newCriteria = criteria;
  if (selectedOrgInfo && organizationId) {
    newCriteria = addFacilitiesToSearch(selectedOrgInfo, organizationId, criteria);
  }
  return {
    operation: 'and',
    children: Object.values(newCriteria),
  };
}

export function addFacilitiesToSearch(
  selectedOrgInfo: SelectedOrgInfo,
  organizationId: number,
  previousCriterias?: SeedSearchCriteria
) {
  const newCriteria = previousCriterias ? Object.values(previousCriterias) : [];
  if (selectedOrgInfo.selectedFacility) {
    newCriteria.unshift({ field: 'facility_id', values: [selectedOrgInfo.selectedFacility.id], operation: 'field' });
  } else {
    if (selectedOrgInfo.selectedSite) {
      newCriteria.unshift({
        field: 'facility_site_id',
        values: [selectedOrgInfo.selectedSite.id],
        operation: 'field',
      });
    } else {
      if (selectedOrgInfo.selectedProject) {
        newCriteria.unshift({
          field: 'facility_site_project_id',
          values: [selectedOrgInfo.selectedProject.id],
          operation: 'field',
        });
      } else {
        newCriteria.unshift({
          field: 'facility_site_project_organization_id',
          values: [organizationId],
          operation: 'field',
        });
      }
    }
  }
  return newCriteria;
}

/*******************
 * ACCESSION SEARCH
 *******************/

const SEARCH_ENDPOINT = '/api/v1/search';
type SearchRequestPayload = paths[typeof SEARCH_ENDPOINT]['post']['requestBody']['content']['application/json'];
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

const SEARCH_ACCESSIONS_ENDPOINT = '/api/v1/seedbank/search';
type SearchAccessionsRequestPayload =
  paths[typeof SEARCH_ACCESSIONS_ENDPOINT]['post']['requestBody']['content']['application/json'];
export type SearchAccessionsResponsePayload =
  paths[typeof SEARCH_ACCESSIONS_ENDPOINT]['post']['responses'][200]['content']['application/json'];
export type SearchAccessionsResponseElement = SearchResponsePayload['results'][0];
export async function searchAccession(
  params: SearchAccessionsRequestPayload
): Promise<SearchAccessionsResponseElement[] | null> {
  try {
    const response: SearchAccessionsResponsePayload = (await axios.post(SEARCH_ACCESSIONS_ENDPOINT, params)).data;
    return response.results;
  } catch {
    return null;
  }
}

/*
 * getAccessionsByNumber() does a fuzzy search for accessions based on the accession number.
 * e.g. if you have accession 1234 and 1253 then passing accessionNumber = 12 will return both
 * accessions 1234 and 1253.
 */
export async function getAccessionsByNumber(
  accessionNumber: number,
  facilityId: number
): Promise<SearchResponseElement[] | null> {
  try {
    const searchParams: SearchAccessionsRequestPayload = {
      facilityId,
      fields: ['accessionNumber'],
      sortOrder: [{ field: 'accessionNumber', direction: 'Ascending' }],
      filters: [
        {
          field: 'accessionNumber',
          values: [accessionNumber.toString()],
          type: 'Fuzzy',
        },
      ],
      count: 8,
    };

    return await searchAccession(searchParams);
  } catch {
    return null;
  }
}

export async function getPendingAccessions(
  selectedValues: SelectedOrgInfo,
  organizationId: number
): Promise<SearchResponseElement[] | null> {
  const searchParams: SearchRequestPayload = {
    prefix: 'projects.sites.facilities.accessions',
    fields: ['accessionNumber', 'bagNumber', 'speciesName', 'siteLocation', 'collectedDate', 'receivedDate'],
    search: convertToSearchNodePayload(
      [
        {
          field: 'state',
          values: ['Awaiting Check-In'],
          operation: 'field',
        },
      ],
      selectedValues,
      organizationId
    ),
    sortOrder: [{ field: 'accessionNumber', direction: 'Ascending' }],
    count: 1000,
  };

  return await search(searchParams);
}

/***********************
 * COLUMN VALUES SEARCH
 ***********************/

/*
 * filterSelectFields()
 * input: a list of search field names
 * output: a list of search field names that are associated with fields that have either
 *         single or multi select values (as opposed to date range values, for example).
 */
export function filterSelectFields(fields: string[]): string[] {
  return fields.reduce((acum: string[], value) => {
    const dbColumn: DatabaseColumn = COLUMNS_INDEXED[value];
    if (['multiple_selection', 'single_selection'].includes(dbColumn.filter?.type ?? '')) {
      acum.push(dbColumn.key);
    }

    return acum;
  }, [] as string[]);
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
export async function getAllFieldValues(fields: string[], facilityId: number): Promise<AllFieldValuesMap | null> {
  try {
    const params: ListAllFieldValuesRequestPayload = {
      facilityId,
      fields,
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
 * "search" will be "all accession associated with the given facilityId".
 * Returns null if the API request failed.
 */
export async function searchFieldValues(
  fields: string[],
  searchCriteria: SeedSearchCriteria,
  facilityId: number
): Promise<FieldValuesMap | null> {
  try {
    const formattedSearch = convertToSearchNodePayload(searchCriteria);
    const params: ValuesPostRequestBody = {
      facilityId,
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
 * PRIMARY COLLECTORS SEARCH
 ****************************/

/*
 * Returns all the Primary Collectors associated with a facility, or null if the API request failed.
 */
export async function getPrimaryCollectors(facilityId: number): Promise<string[] | null> {
  try {
    const params: ListAllFieldValuesRequestPayload = {
      facilityId,
      fields: ['primaryCollectorName'],
    };

    return (await listAllFieldValues(params)).results.primaryCollectorName.values;
  } catch {
    return null;
  }
}
