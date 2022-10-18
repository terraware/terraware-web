import axios from '..';
import { paths } from 'src/api/types/generated-schema';

export const SEARCH_ENDPOINT = '/api/v1/search';
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
