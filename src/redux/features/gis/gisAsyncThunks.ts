import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response2 } from 'src/services/HttpService';
import GisService, { GisResponseData } from 'src/services/gis/GisService';
import strings from 'src/strings';

export const requestGetGis = createAsyncThunk(
  'ges/get-one',
  async (request: { cqlFilter: string; typeNames: string; propertyName: string }, { rejectWithValue }) => {
    const { cqlFilter, typeNames, propertyName } = request;
    const response: Response2<GisResponseData> = await GisService.get({
      service: 'wfs',
      version: '2.0.0',
      request: 'GetFeature',
      typeNames,
      propertyName,
      outputFormat: 'application/json',
      srsName: 'EPSG:4326',
      cql_filter: cqlFilter,
    });

    if (response && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
