import { paths } from 'src/api/types/generated-schema';
import axios from './index';

const clockEndpoint = '/api/v1/seedbank/clock';
type ClockGetResponse = paths[typeof clockEndpoint]['get']['responses'][200]['content']['application/json'];

/*
 * getDate() always returns a promise that resolves. If we were able to fetch the server's time, then serverTime will
 * be non-null. Otherwise, callers can use localTime as a fallback.
 * Both serverTime and localTime are in seconds since the epoch.
 */
export type GetDateResponse = {
  serverTime: number | null;
  localTime: number;
};

export async function getDate(): Promise<GetDateResponse> {
  const response: GetDateResponse = {
    serverTime: null,
    localTime: new Date().getTime(),
  };

  try {
    const apiResponse: ClockGetResponse = (await axios.get(clockEndpoint)).data;
    response.serverTime = Date.parse(apiResponse.currentTime);
  } catch {
    console.error('getDate() unable to fetch the server time. Callers will be forced to use the fallback local time');
  }

  return response;
}
