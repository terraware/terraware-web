import axios from '..';
import {components, paths} from 'src/api/types/generated-schema';
import {COLUMNS_INDEXED, DatabaseColumn} from '../../components/seeds/database/columns';

export type SeedSearchFilters = Record<string, SearchNodePayload>;
export const DEFAULT_SEED_SEARCH_FILTERS = {};
export type SeedSearchSortOrder = components['schemas']['SearchSortOrderElement'];
export const DEFAULT_SEED_SEARCH_SORT_ORDER = {
  field: 'receivedDate',
  direction: 'Descending',
} as SeedSearchSortOrder;

export type SearchField = components['schemas']['SearchField'];
export type SearchFilter = components['schemas']['SearchFilter'];

export type AndNodePayload = components['schemas']['AndNodePayload'] & { operation: 'and'; };
export type FieldNodePayload = components['schemas']['FieldNodePayload'] & { operation: 'field'; };
export type NotNodePayload = components['schemas']['NotNodePayload'] & { operation: 'not'; };
export type OrNodePayload = components['schemas']['OrNodePayload'] & { operation: 'or'; };
export type SearchNodePayload = AndNodePayload | FieldNodePayload | NotNodePayload | OrNodePayload;
export type FieldValuesPayload = { [key: string]: components['schemas']['FieldValuesPayload']; };


/**********************
 * SEARCH HELPERS
 **********************/

const SEARCH_ENDPOINT = '/api/v1/seedbank/search';
export type SearchRequestPayload = paths[typeof SEARCH_ENDPOINT]['post']['requestBody']['content']['application/json'];
export type SearchResponsePayload = paths[typeof SEARCH_ENDPOINT]['post']['responses'][200]['content']['application/json'];
export type SearchResponseResults = SearchResponsePayload['results'][0];

export async function search(params: SearchRequestPayload): Promise<SearchResponsePayload> {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${SEARCH_ENDPOINT}`;
  const response: SearchResponsePayload = (await axios.post(endpoint, params)).data;

  return response;
}

const FIELD_VALUES_ENDPOINT = '/api/v1/seedbank/values';
export type ValuesPostRequestBody = paths[typeof FIELD_VALUES_ENDPOINT]['post']['requestBody']['content']['application/json'];
export type ValuesPostResponse = paths[typeof FIELD_VALUES_ENDPOINT]['post']['responses'][200]['content']['application/json'];

export async function searchFieldValues(params: ValuesPostRequestBody): Promise<ValuesPostResponse> {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${FIELD_VALUES_ENDPOINT}`;
  const response: ValuesPostResponse = (await axios.post(endpoint, params)).data;

  return response;
}

const ALL_FIELD_VALUES_ENDPOINT = '/api/v1/seedbank/values/all';
// TODO Remove this export
export type ListAllFieldValuesRequestPayload =
  paths[typeof ALL_FIELD_VALUES_ENDPOINT]['post']['requestBody']['content']['application/json'];
type ListAllFieldValuesResponsePayload =
  paths[typeof ALL_FIELD_VALUES_ENDPOINT]['post']['responses'][200]['content']['application/json'];
export type AllFieldValuesPayload = ListAllFieldValuesResponsePayload['results'];

export async function listAllFieldValues(params: ListAllFieldValuesRequestPayload): Promise<ListAllFieldValuesResponsePayload> {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${ALL_FIELD_VALUES_ENDPOINT}`;
  const response: ListAllFieldValuesResponsePayload = (await axios.post(endpoint, params)).data;

  return response;
}

/****************************
 * PRIMARY COLLECTORS SEARCH
 ****************************/

export async function getPrimaryCollectors(facilityId: number): Promise<string[]> {
  const params: ListAllFieldValuesRequestPayload = {
    facilityId,
    fields: ['primaryCollector'],
  };

  return (await listAllFieldValues(params)).results.primaryCollector.values;
}

/*******************
 * ACCESSION SEARCH
 *******************/

export type GetAccessionByNumberResponse = {
  accessions: SearchResponseResults[] | null;  // empty list if none found, null if error occurred
};

export async function getAccessionsByNumber(accessionNumber: number, facilityId: number): Promise<GetAccessionByNumberResponse> {
  const response: GetAccessionByNumberResponse = {
    accessions: null,
  };

  try {
    const searchParams: SearchRequestPayload = {
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

    response.accessions = (await search(searchParams)).results;
  } catch {
    console.log('API call failed: search accessions by number.');
  }

  return response;
}

export async function getPendingAccessions(facilityId: number): Promise<SearchResponsePayload> {
  const searchParams: SearchRequestPayload = {
    facilityId,
    fields: ['accessionNumber', 'bagNumber', 'species', 'siteLocation', 'collectedDate', 'receivedDate'],
    sortOrder: [{ field: 'accessionNumber', direction: 'Ascending' }],
    filters: [
      {
        field: 'state',
        values: ['Awaiting Check-In'],
        type: 'Exact',
      },
    ],
    count: 1000,
  };

  return await search(searchParams);
}

/****************
 * COLUMN SEARCH
 ****************/

export function findSingleAndMultiChoiceFields(fields: SearchField[]): SearchField[] {
  return fields.reduce((acum: SearchField[], value) => {
    const dbColumn: DatabaseColumn = COLUMNS_INDEXED[value];
    if (['multiple_selection', 'single_selection'].includes(dbColumn.filter?.type ?? '')) {
      acum.push(dbColumn.key);
    }

    return acum;
  }, [] as any[]);
}

export type GetAllFieldOptionsResponse = {
  fieldValuesByFieldName: AllFieldValuesPayload | null;  // null if the request failed
};

export async function getAllFieldOptions(fields: SearchField[], facilityId: number): Promise<GetAllFieldOptionsResponse>{
  const response: GetAllFieldOptionsResponse = { fieldValuesByFieldName: null };

  try {
    const params: ListAllFieldValuesRequestPayload = {
      facilityId,
      fields
    };
    response.fieldValuesByFieldName = (await listAllFieldValues(params)).results;
  } catch {
    console.log('API call failed: getAllFieldOptions');
  }

  return response;
}
