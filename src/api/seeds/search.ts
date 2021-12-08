import axios from '..';
import {
  searchEndpoint,
  SearchPostRequestBody,
  SearchPostResponse,
  SearchRequestPayload,
  SearchResponsePayload,
  valuesAllEndpoint,
  ValuesAllPostRequestBody,
  ValuesAllPostResponse,
  valuesEndpoint,
  ValuesPostRequestBody,
  ValuesPostResponse,
} from '../types/search';

export async function search(params: SearchPostRequestBody): Promise<SearchPostResponse> {
  const response: SearchPostResponse = (await axios.post(searchEndpoint, params)).data;

  return response;
}

export async function searchValues(params: ValuesPostRequestBody): Promise<ValuesPostResponse> {
  const response: ValuesPostResponse = (await axios.post(valuesEndpoint, params)).data;

  return response;
}

export async function searchAllValues(params: ValuesAllPostRequestBody): Promise<ValuesAllPostResponse> {
  const response: ValuesAllPostResponse = (await axios.post(valuesAllEndpoint, params)).data;

  return response;
}

export async function getPrimaryCollectors(facilityId: number): Promise<string[]> {
  const params: ValuesAllPostRequestBody = {
    facilityId,
    fields: ['primaryCollector'],
  };

  return (await searchAllValues(params)).results.primaryCollector.values;
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
