import { paths } from 'src/api/types/generated-schema';
import { DeviceManager } from 'src/types/DeviceManager';

import axios from '..';
import addQueryParams from '../helpers/addQueryParams';

const DEVICE_MANAGERS_ENDPOINT = '/api/v1/devices/managers';

type GetDeviceManagersResponsePayload =
  paths[typeof DEVICE_MANAGERS_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type DeviceManagersQuery = paths[typeof DEVICE_MANAGERS_ENDPOINT]['get']['parameters']['query'];
type DeviceManagersResponse = {
  managers: DeviceManager[];
  requestSucceeded: boolean;
};

/*
 * search device managers by short code or facility id
 */

export type ListDeviceManagersParams = {
  sensorKitId?: string;
  facilityId?: number;
};

export const listDeviceManagers = async ({
  sensorKitId,
  facilityId,
}: ListDeviceManagersParams): Promise<DeviceManagersResponse> => {
  const response: DeviceManagersResponse = {
    managers: [],
    requestSucceeded: true,
  };

  try {
    const queryParams: DeviceManagersQuery = { sensorKitId, facilityId };
    const endpoint = addQueryParams(DEVICE_MANAGERS_ENDPOINT, queryParams);
    const serverResponse: GetDeviceManagersResponsePayload = (await axios.get(endpoint)).data;

    response.managers = serverResponse.managers;
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};

/**
 * Get device manager by id
 */

const DEVICE_MANAGER_ENDPOINT = '/api/v1/devices/managers/{deviceManagerId}';

type GetDeviceManagerResponsePayload =
  paths[typeof DEVICE_MANAGER_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type DeviceManagerResponse = {
  manager?: DeviceManager;
  requestSucceeded: boolean;
};

export const getDeviceManager = async (deviceManagerId: number): Promise<DeviceManagerResponse> => {
  const response: DeviceManagerResponse = {
    manager: undefined,
    requestSucceeded: false,
  };

  try {
    const url = DEVICE_MANAGER_ENDPOINT.replace('{deviceManagerId}', deviceManagerId.toString());
    const serverResponse: GetDeviceManagerResponsePayload = (await axios.get(url)).data;

    response.manager = serverResponse.manager;
    response.requestSucceeded = true;
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};

/**
 * Connect device manager to facility
 */

const DEVICE_MANAGER_CONNECT_ENDPOINT = '/api/v1/devices/managers/{deviceManagerId}/connect';
type ConnectDeviceManagerRequestPayload =
  paths[typeof DEVICE_MANAGER_CONNECT_ENDPOINT]['post']['requestBody']['content']['application/json'];
type ConnectResponse = {
  requestSucceeded: boolean;
};

export const connectDeviceManager = async (deviceManagerId: number, facilityId: number): Promise<ConnectResponse> => {
  const response: ConnectResponse = {
    requestSucceeded: true,
  };

  try {
    const url = DEVICE_MANAGER_CONNECT_ENDPOINT.replace('{deviceManagerId}', deviceManagerId.toString());
    const connectRequestPayload: ConnectDeviceManagerRequestPayload = { facilityId };

    await axios.post(url, connectRequestPayload);
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};
