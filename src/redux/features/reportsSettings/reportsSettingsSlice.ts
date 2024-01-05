import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReportsSettingsResponsePayload } from 'src/services/ReportSettingsService';

type Payload = {
  settings?: ReportsSettingsResponsePayload;
};

const initialState: Payload = {};

export const reportsSettingsSlice = createSlice({
  name: 'reportsSettingsSlice',
  initialState,
  reducers: {
    setReportsSettingsAction: (state, action: PayloadAction<Payload>) => {
      if (action.payload.settings) {
        state.settings = action.payload.settings;
      }
    },
  },
});

export const { setReportsSettingsAction } = reportsSettingsSlice.actions;

export const reportsSettingsReducer = reportsSettingsSlice.reducer;
