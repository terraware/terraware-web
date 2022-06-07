import axios from '..';
import { Device, DeviceTemplate } from 'src/types/Device';
import { paths } from 'src/api/types/generated-schema';
import addQueryParams from '../helpers/addQueryParams';
import { Timeseries, TimeseriesHistory } from 'src/types/Timeseries';

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

const TIMESERIES_ENDPOINT = '/api/v1/timeseries';
type TimeseriesResponse = {
  timeseries: Timeseries[];
  requestSucceeded: boolean;
};

type ListTimeseriesResponsePayload =
  paths[typeof TIMESERIES_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type TimeseriesQuery = paths[typeof TIMESERIES_ENDPOINT]['get']['parameters']['query'];

export const listTimeseries = async (device: Device): Promise<TimeseriesResponse> => {
  const response: TimeseriesResponse = {
    timeseries: [],
    requestSucceeded: true,
  };

  try {
    const queryParams: TimeseriesQuery = { deviceId: [device.id] };
    const endpoint = addQueryParams(TIMESERIES_ENDPOINT, queryParams);
    const serverResponse: ListTimeseriesResponsePayload = (await axios.get(endpoint)).data;

    response.timeseries = serverResponse.timeseries.map((ts) => ({
      deviceId: ts.deviceId,
      timeseriesName: ts.timeseriesName,
      type: ts.type,
      decimalPlaces: ts.decimalPlaces,
      units: ts.units,
      latestValue: ts.latestValue,
    }));
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};

const TIMESERIES_HISTORY_ENDPOINT = '/api/v1/timeseries/history';
type TimeseriesHistoryResponse = {
  values: TimeseriesHistory[];
  requestSucceeded: boolean;
};

type GetTimeseriesResponsePayload =
  paths[typeof TIMESERIES_HISTORY_ENDPOINT]['post']['responses'][200]['content']['application/json'];

type GetTimeseriesRequestPayload =
  paths[typeof TIMESERIES_HISTORY_ENDPOINT]['post']['requestBody']['content']['application/json'];

export type timeseriesType = {
  deviceId: number;
  timeseriesName: string;
};

export const getTimeseriesHistory = async (
  startTime: string,
  endTime: string,
  timeseries: timeseriesType[],
  count: number
): Promise<TimeseriesHistoryResponse> => {
  const response: TimeseriesHistoryResponse = {
    values: [],
    requestSucceeded: true,
  };

  const getTimeseriesRequestPayload: GetTimeseriesRequestPayload = {
    startTime,
    endTime,
    timeseries,
    count,
  };

  try {
    const serverResponse: GetTimeseriesResponsePayload = (
      await axios.post(TIMESERIES_HISTORY_ENDPOINT, getTimeseriesRequestPayload)
    ).data;

    response.values = serverResponse.values;
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};
