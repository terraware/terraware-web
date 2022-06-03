import axios from '..';
import { DeviceManager } from 'src/types/DeviceManager';
import { paths } from 'src/api/types/generated-schema';
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
 * search device managers by short code
 */
export const listDeviceManagers = async (shortCode: string): Promise<DeviceManagersResponse> => {
  const response: DeviceManagersResponse = {
    managers: [],
    requestSucceeded: true,
  };

  try {
    const queryParams: DeviceManagersQuery = { shortCode };
    const endpoint = addQueryParams(DEVICE_MANAGERS_ENDPOINT, queryParams);
    const serverResponse: GetDeviceManagersResponsePayload = (await axios.get(endpoint)).data;

    response.managers = serverResponse.managers;
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};
