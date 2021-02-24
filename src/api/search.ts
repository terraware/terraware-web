import axios from 'axios';
import { ListFieldValuesRequestPayload, ListFieldValuesResponsePayload, SearchRequestPayload, SearchResponsePayload } from './types/search';

const BASE_URL = '/api/v1/seedbank';

export const search = async (params: SearchRequestPayload): Promise<SearchResponsePayload> => {
  const endpoint = `${BASE_URL}/search`;
  return (await axios.post(endpoint, params)).data;
};

export const searchValues = async (params: ListFieldValuesRequestPayload): Promise<ListFieldValuesResponsePayload> => {
  const endpoint = `${BASE_URL}/values`;
  return (await axios.post(endpoint, params)).data;
};

