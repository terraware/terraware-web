import { createAsyncThunk } from '@reduxjs/toolkit';

import LocationService from 'src/services/LocationService';
import strings from 'src/strings';

export const requestGetCountryBoundary = createAsyncThunk(
  'countries/getBoundary',
  async (countryCode: string, { rejectWithValue }) => {
    const response = await LocationService.getCountryBoundary(countryCode);

    if (response && response.requestSucceeded && response.data) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestListCountries = createAsyncThunk('countries/list', async (_, { rejectWithValue }) => {
  const response = await LocationService.getCountries();

  if (response) {
    return response;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});

export const requestListTimezones = createAsyncThunk('timezones/list', async (_, { rejectWithValue }) => {
  const response = await LocationService.getTimeZones();

  if (response && response.requestSucceeded) {
    return response.timeZones;
  }

  return rejectWithValue(strings.GENERIC_ERROR);
});
