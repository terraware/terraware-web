import { paths } from 'src/api/types/generated-schema';
import { Country } from 'src/types/Country';
import HttpService, { Response } from './HttpService';
import SearchService, { SearchRequestPayload, SearchResponseElement } from './SearchService';

const TIMEZONES_ENDPOINT = '/api/v1/i18n/timeZones';

type TimeZonesServerResponse = paths[typeof TIMEZONES_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type TimeZone = TimeZonesServerResponse['timeZones'][0];
export type TimeZones = TimeZone[];

export type TimeZonesResponse = Response & TimeZonesData;

export type TimeZonesData = {
  timeZones: TimeZones;
};

const httpTimeZones = HttpService.root(TIMEZONES_ENDPOINT);

/**
 * Gets the time zone definitions for the current locale. This assumes that Axios has already
 * been configured to send the currently-selected locale in the Accept-Language header.
 */
export const getTimeZones = async (): Promise<TimeZonesResponse> => {
  const response: TimeZonesResponse = await httpTimeZones.get<TimeZonesServerResponse, TimeZonesData>({}, (data) => ({
    timeZones: data?.timeZones ?? [],
  }));

  return response;
};

/**
 * Return countries list from BE database
 */
const getCountries = async (): Promise<Country[] | null> => {
  const params: SearchRequestPayload = {
    prefix: 'country',
    fields: ['code', 'name', 'subdivisions.code', 'subdivisions.name'],
    sortOrder: [{ field: 'name' }, { field: 'subdivisions.name' }],
    count: 1000,
  };
  const response: SearchResponseElement[] | null = await SearchService.search(params);

  return (
    response?.map((result: SearchResponseElement) => {
      return {
        code: result.code,
        name: result.name,
        subdivisions: result.subdivisions,
      } as Country;
    }) ?? null
  );
};

/**
 * Exported functions
 */
const LocationService = {
  getTimeZones,
  getCountries,
};

export default LocationService;
