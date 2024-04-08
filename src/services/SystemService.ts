import { paths } from 'src/api/types/generated-schema';

import HttpService, { Response } from './HttpService';

/**
 * Service for systems related functionality
 */

/**
 * Types exported from service
 */
export type Clock = {
  serverTime: number | null;
  localTime: number;
};

export type ClockResponse = Response & Clock;

export type AppVersion = {
  version: string;
};

export type AppVersionResponse = Response & AppVersion;

// endpoint
const CLOCK_ENDPOINT = '/api/v1/seedbank/clock';
const APP_VERSION = '/build-version.txt';

type ClockServerResponse = paths[typeof CLOCK_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const httpClock = HttpService.root(CLOCK_ENDPOINT);
const httpAppVersion = HttpService.root(APP_VERSION);

/**
 * get server time
 */
const getClock = async (): Promise<ClockResponse> => {
  const response: ClockResponse = await httpClock.get<ClockServerResponse, Clock>({}, (data) => ({
    localTime: Date.now(),
    serverTime: data?.currentTime ? Date.parse(data.currentTime) : null,
  }));

  return response;
};

/**
 * get app version
 */
const getLatestAppVersion = async (): Promise<AppVersionResponse> => {
  const params = { timestamp: Date.now().toString() };
  const response: AppVersionResponse = await httpAppVersion.get<any, AppVersion>({ params }, (version) => ({
    version: version ?? '',
  }));

  return response;
};

/**
 * Exported functions
 */
const SystemService = {
  getClock,
  getLatestAppVersion,
};

export default SystemService;
