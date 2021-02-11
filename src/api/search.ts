import axios from 'axios';
import { SearchRequestPayload, SearchResponsePayload } from './types/search';

const BASE_URL = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank`

export const search = async (params: SearchRequestPayload): Promise<SearchResponsePayload> => {
  const endpoint = `${BASE_URL}/search`;
  return (await axios.post(endpoint, params)).data;
};
