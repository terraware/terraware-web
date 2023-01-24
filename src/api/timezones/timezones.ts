import axios from 'axios';
import { paths } from '../types/generated-schema';
import { addError } from '../utils';

const TIMEZONES_ENDPOINT = '/api/v1/i18n/timeZones';

type ListTimeZoneNamesResponsePayload =
  paths[typeof TIMEZONES_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type TimeZone = ListTimeZoneNamesResponsePayload['timeZones'][0];

type GetTimeZonesResponse = {
  requestSucceeded: boolean;
  timeZones: TimeZone[] | undefined;
  error?: string;
};

/**
 * Gets the time zone definitions for the current locale. This assumes that Axios has already
 * been configured to send the currently-selected locale in the Accept-Language header.
 */
export const getTimeZones = async (): Promise<GetTimeZonesResponse> => {
  const response: GetTimeZonesResponse = {
    requestSucceeded: true,
    timeZones: undefined,
  };
  try {
    const serverResponse: ListTimeZoneNamesResponsePayload = (await axios.get(TIMEZONES_ENDPOINT)).data;
    response.timeZones = serverResponse.timeZones;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
      addError(serverResponse, response);
    }
  } catch (e: any) {
    response.requestSucceeded = false;
    addError(e?.response?.data || {}, response);
  }
  return response;
};
