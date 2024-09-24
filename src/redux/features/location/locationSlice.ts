import { createSlice } from '@reduxjs/toolkit';

import { TimeZone } from 'src/services/LocationService';
import { Country } from 'src/types/Country';
import { MultiPolygon } from 'src/types/Tracking';

import { StatusT, buildReducers } from '../asyncUtils';
import { requestGetCountryBoundary, requestListCountries, requestListTimezones } from './locationAsyncThunks';

/**
 * Get country boundary
 */
const initialStateCountryBoundary: { [key: string]: StatusT<MultiPolygon> } = {};

export const countryBoundarySlice = createSlice({
  name: 'countryBoundarySlice',
  initialState: initialStateCountryBoundary,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetCountryBoundary, true)(builder);
  },
});

/**
 * List countries
 */
const initialStateCountriesList: { [key: string]: StatusT<Country[]> } = {};

export const countriesListSlice = createSlice({
  name: 'countriesListSlice',
  initialState: initialStateCountriesList,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListCountries)(builder);
  },
});

/**
 * List timezones
 */
const initialStateTimezonesList: { [key: string]: StatusT<TimeZone[]> } = {};

export const timezonesListSlice = createSlice({
  name: 'timezonesListSlice',
  initialState: initialStateTimezonesList,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListTimezones)(builder);
  },
});

const locationReducers = {
  countryBoundary: countryBoundarySlice.reducer,
  countries: countriesListSlice.reducer,
  timezones: timezonesListSlice.reducer,
};

export default locationReducers;
