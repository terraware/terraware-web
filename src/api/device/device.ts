import axios from '..';
import { DeviceTemplate, DeviceConfig } from 'src/types/Device';
import { paths } from 'src/api/types/generated-schema';
import addQueryParams from '../helpers/addQueryParams';

const DEVICES_ENDPOINT = '/api/v1/devices';
const TEMPLATES_ENDPOINT = '/api/v1/devices/templates';
const FACILITIES_DEVICE_CONFIGS_ENDPOINT = '/api/v1/facilities/{facilityId}/devices';

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
      pollingInterval: template.pollingInterval,
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
      pollingInterval: template.pollingInterval,
    };

    await axios.post(DEVICES_ENDPOINT, createDeviceRequestPayload);
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};

/**
 * List device configs for facility
 */
type ListDeviceConfigsResponse =
  paths[typeof FACILITIES_DEVICE_CONFIGS_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type DeviceConfigsResponse = {
  devices: DeviceConfig[];
  requestSucceeded: boolean;
};

export const listDeviceConfigs = async (facilityId: number): Promise<DeviceConfigsResponse> => {
  const url = FACILITIES_DEVICE_CONFIGS_ENDPOINT.replace('{facilityId}', facilityId.toString());
  const response: DeviceConfigsResponse = {
    devices: [],
    requestSucceeded: true,
  };

  try {
    const serverResponse: ListDeviceConfigsResponse = (await axios.get(url)).data;

    response.devices = serverResponse.devices.map((device) => ({
      id: device.id,
      facilityId: device.facilityId,
      name: device.name,
      type: device.type,
      make: device.make,
      model: device.model,
      protocol: device.protocol,
      address: device.address,
      port: device.port,
      settings: device.settings,
      pollingInterval: device.pollingInterval,
      parentId: device.parentId,
    }));
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};
