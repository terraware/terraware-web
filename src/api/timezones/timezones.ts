import axios from 'axios';
import addQueryParams from '../helpers/addQueryParams';
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

type GetTimeZonesQuery = paths[typeof TIMEZONES_ENDPOINT]['get']['parameters']['query'];

export const getTimeZones = async (locale?: string): Promise<GetTimeZonesResponse> => {
  const response: GetTimeZonesResponse = {
    requestSucceeded: true,
    timeZones: undefined,
  };
  try {
    const queryParams: GetTimeZonesQuery = { locale };
    const endpoint = addQueryParams(TIMEZONES_ENDPOINT, queryParams);
    const serverResponse: ListTimeZoneNamesResponsePayload = (await axios.get(endpoint)).data;
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
