import axios from 'axios';

import { Device } from 'src/types/Device';
import { Timeseries, TimeseriesHistory } from 'src/types/Timeseries';

import addQueryParams from '../helpers/addQueryParams';
import { paths } from '../types/generated-schema';

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
