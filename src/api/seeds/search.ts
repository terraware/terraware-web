import axios from '..';
import {
  searchEndpoint,
  SearchPostRequestBody,
  SearchPostResponse,
  SearchRequestPayload,
  SearchResponsePayload,
  SearchResponseResults,
  valuesAllEndpoint,
  ValuesAllPostRequestBody,
  ValuesAllPostResponse,
  valuesEndpoint,
  ValuesPostRequestBody,
  ValuesPostResponse,
} from '../types/search';

export async function search(params: SearchPostRequestBody): Promise<SearchPostResponse> {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${searchEndpoint}`;
  const response: SearchPostResponse = (await axios.post(endpoint, params)).data;

  return response;
}

export async function searchValues(params: ValuesPostRequestBody): Promise<ValuesPostResponse> {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${valuesEndpoint}`;
  const response: ValuesPostResponse = (await axios.post(endpoint, params)).data;

  return response;
}

export async function searchAllValues(params: ValuesAllPostRequestBody): Promise<ValuesAllPostResponse> {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${valuesAllEndpoint}`;
  const response: ValuesAllPostResponse = (await axios.post(endpoint, params)).data;

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
