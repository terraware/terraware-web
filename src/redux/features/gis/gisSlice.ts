import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { GisResponse } from 'src/services/gis/GisService';

import { requestGetGis } from './gisAsyncThunks';

const initialGisState: { [key: string]: StatusT<GisResponse> } = {};

export const gisSlice = createSlice({
  name: 'gisSlice',
  initialState: initialGisState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetGis, true)(builder);
  },
});

const gisReducers = {
  gisRequest: gisSlice.reducer,
};

export default gisReducers;
