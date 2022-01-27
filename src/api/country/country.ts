import axios from 'axios';
import { Country } from 'src/types/Country';
import { paths } from '../types/generated-schema';

const SEARCH_ENDPOINT = '/api/v1/search';
type SearchRequestPayload = paths[typeof SEARCH_ENDPOINT]['post']['requestBody']['content']['application/json'];
type SearchResponsePayload = paths[typeof SEARCH_ENDPOINT]['post']['responses'][200]['content']['application/json'];

export async function searchCountries(): Promise<Country[] | null> {
  const params: SearchRequestPayload = {
    prefix: 'country',
    fields: ['code', 'name', 'subdivisions.code', 'subdivisions.name'],
    count: 1000,
  };
  try {
    const response: SearchResponsePayload = (await axios.post(SEARCH_ENDPOINT, params)).data;
    return response.results.map((result) => {
      return {
        code: result.code,
        name: result.name,
        subdivisions: result.subdivisions,
      } as Country;
    });
  } catch {
    return null;
  }
}
