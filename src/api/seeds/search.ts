import axios from '..';
import {
  searchEndpoint,
  SearchPostRequestBody,
  SearchPostResponse,
  valuesAllEndpoint,
  ValuesAllPostRequestBody,
  ValuesAllPostResponse,
  valuesEndpoint,
  ValuesPostRequestBody,
  ValuesPostResponse,
} from '../types/search';

export const search = async (params: SearchPostRequestBody): Promise<SearchPostResponse> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${searchEndpoint}`;
  const response: SearchPostResponse = (await axios.post(endpoint, params)).data;

  return response;
};

export const searchValues = async (params: ValuesPostRequestBody): Promise<ValuesPostResponse> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${valuesEndpoint}`;
  const response: ValuesPostResponse = (await axios.post(endpoint, params)).data;

  return response;
};

export const searchAllValues = async (params: ValuesAllPostRequestBody): Promise<ValuesAllPostResponse> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${valuesAllEndpoint}`;
  const response: ValuesAllPostResponse = (await axios.post(endpoint, params)).data;

  return response;
};

export const findPrimaryCollectors = async (facilityId: number): Promise<string[]> => {
  const params: ValuesAllPostRequestBody = {
    facilityId,
    fields: ['primaryCollector'],
  };

  return (await searchAllValues(params)).results.primaryCollector.values;
};
