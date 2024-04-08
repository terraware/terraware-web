import { paths } from 'src/api/types/generated-schema';
import { Device, DeviceTemplate } from 'src/types/Device';

import axios from '..';
import addQueryParams from '../helpers/addQueryParams';

const DEVICES_ENDPOINT = '/api/v1/devices';
const TEMPLATES_ENDPOINT = '/api/v1/devices/templates';

type ListDeviceTemplatesResponsePayload =
  paths[typeof TEMPLATES_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type DeviceTemplatesQuery = paths[typeof TEMPLATES_ENDPOINT]['get']['parameters']['query'];
type DeviceTemplateCategory = 'PV';
type DeviceTemplatesResponse = {
  templates: DeviceTemplate[];
  requestSucceeded: boolean;
};

/*
 * list all device templates off category
 */
export const listDeviceTemplates = async (category?: DeviceTemplateCategory): Promise<DeviceTemplatesResponse> => {
  const response: DeviceTemplatesResponse = {
    templates: [],
    requestSucceeded: true,
  };

  try {
    const queryParams: DeviceTemplatesQuery = { category };
    const endpoint = addQueryParams(TEMPLATES_ENDPOINT, queryParams);
    const serverResponse: ListDeviceTemplatesResponsePayload = (await axios.get(endpoint)).data;

    response.templates = serverResponse.templates.map((template) => ({
      id: template.id,
      category: template.category,
      name: template.name,
      type: template.type,
      make: template.make,
      model: template.model,
      protocol: template.protocol,
      address: template.address,
      port: template.port,
      settings: template.settings,
      verbosity: template.verbosity,
    }));
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};

/**
 * Create device off device template
 */

type CreateDeviceRequestPayload = paths[typeof DEVICES_ENDPOINT]['post']['requestBody']['content']['application/json'];
type CreateDeviceResponse = {
  requestSucceeded: boolean;
};

export const createDevice = async (facilityId: number, template: DeviceTemplate): Promise<CreateDeviceResponse> => {
  const response: CreateDeviceResponse = {
    requestSucceeded: true,
  };

  try {
    const createDeviceRequestPayload: CreateDeviceRequestPayload = {
      facilityId,
      name: template.name,
      type: template.type,
      make: template.make,
      model: template.model,
      protocol: template.protocol,
      address: template.address,
      port: template.port,
      settings: template.settings,
      verbosity: template.verbosity,
    };

    await axios.post(DEVICES_ENDPOINT, createDeviceRequestPayload);
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};

/**
 * Update device
 */

const UPDATE_ENDPOINT = '/api/v1/devices/{id}';

type UpdateDeviceRequestPayload = paths[typeof UPDATE_ENDPOINT]['put']['requestBody']['content']['application/json'];

type UpdateDeviceResponse = {
  requestSucceeded: boolean;
};

export const updateDevice = async (device: Device): Promise<UpdateDeviceResponse> => {
  const response: UpdateDeviceResponse = {
    requestSucceeded: true,
  };

  try {
    const { id, ...deviceProps } = device;
    const updateDeviceRequestPayload: UpdateDeviceRequestPayload = deviceProps;

    await axios.put(UPDATE_ENDPOINT.replace('{id}', id.toString()), updateDeviceRequestPayload);
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};
