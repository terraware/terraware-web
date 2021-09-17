import axios from 'axios';
import {
  ListAllFieldValuesRequestPayload,
  ListAllFieldValuesResponsePayload,
  ListFieldValuesRequestPayload,
  ListFieldValuesResponsePayload,
  SearchRequestPayload,
  SearchResponsePayload,
} from './types/search';

const BASE_URL = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank`;

export const search = async (
  params: SearchRequestPayload
): Promise<SearchResponsePayload> => {
  const endpoint = `${BASE_URL}/search`;
  return (await axios.post(endpoint, params)).data;
};

export const searchValues = async (
  params: ListFieldValuesRequestPayload
): Promise<ListFieldValuesResponsePayload> => {
  const endpoint = `${BASE_URL}/values`;
  return (await axios.post(endpoint, params)).data;
};

export const searchAllValues = async (
  params: ListAllFieldValuesRequestPayload
): Promise<ListAllFieldValuesResponsePayload> => {
  const endpoint = `${BASE_URL}/values/all`;
  return (await axios.post(endpoint, params)).data;
};
