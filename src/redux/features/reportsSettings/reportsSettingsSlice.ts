import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { GetReportsSettingsResponse, ReportsSettings } from 'src/services/ReportSettingsService';

type Payload = {
  settings?: GetReportsSettingsResponse;
};

type State = {
  settings?: ReportsSettings;
};

const initialState: State = {};

export const reportsSettingsSlice = createSlice({
  name: 'reportsSettingsSlice',
  initialState,
  reducers: {
    setReportsSettingsAction: (state, action: PayloadAction<Payload>) => {
      if (action.payload.settings) {
        // Leaving these here in case we want to do something with invalid responses
        const { status, requestSucceeded, statusCode, ...rest } = action.payload.settings;
        state.settings = rest;
      }
    },
  },
});

export const { setReportsSettingsAction } = reportsSettingsSlice.actions;

const reportsSettingsReducers = {
  reportsSettings: reportsSettingsSlice.reducer,
};

export default reportsSettingsReducers;
