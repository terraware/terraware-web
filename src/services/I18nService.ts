import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from './HttpService';
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
 * Exported functions
 */
const I18nService = {
  getTimeZones,
};

export default I18nService;
