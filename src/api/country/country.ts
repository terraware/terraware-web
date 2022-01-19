import axios from 'axios';
import { Country } from 'src/types/Country';
import { paths } from '../types/generated-schema';

const SEARCH_ENDPOINT = '/api/v1/search';
type SearchRequestPayload = paths[typeof SEARCH_ENDPOINT]['post']['requestBody']['content']['application/json'];
export type SearchResponsePayload =
  paths[typeof SEARCH_ENDPOINT]['post']['responses'][200]['content']['application/json'];
export type SearchResponseElement = SearchResponsePayload['results'][0];

export const searchCountries = async (): Promise<Country[] | null> => {
  const countries: Country[] = [];
  const params: SearchRequestPayload = {
    prefix: 'country',
    fields: ['code', 'name', 'subdivisions.code', 'subdivisions.name'],
    count: 1000,
  };
  try {
    const response: SearchResponsePayload = (await axios.post(SEARCH_ENDPOINT, params)).data;
    response.results.forEach((result) => {
      countries.push({
        code: result.code,
        name: result.name,
        subdivisions: result.subdivisions,
      } as Country);
    });
    return countries;
  } catch {
    return null;
  }
};
