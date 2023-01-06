import axios from 'axios';
import { paths } from '../types/generated-schema';

const TIMEZONES_ENDPOINT = '/api/v1/i18n/timeZones';

type ListTimeZoneNamesResponsePayload =
  paths[typeof TIMEZONES_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type TimeZone = ListTimeZoneNamesResponsePayload['timeZones'][0];

export const getTimeZones = async (): Promise<TimeZone[]> => {
  const response: ListTimeZoneNamesResponsePayload = (await axios.get(TIMEZONES_ENDPOINT)).data;
  return response.timeZones;
};
