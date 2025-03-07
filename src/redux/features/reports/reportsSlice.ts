import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { ExistingAcceleratorReportConfig } from 'src/types/AcceleratorReport';

type Data = {
  config?: ExistingAcceleratorReportConfig;
};

const initialState: Data = {};

export const projectReportConfigSlice = createSlice({
  name: 'projectReportConfigSlice',
  initialState,
  reducers: {
    setProjectReportConfigAction: (state, action: PayloadAction<Data>) => {
      const data: Data = action.payload;
      state.config = data.config;
    },
  },
});

export const { setProjectReportConfigAction } = projectReportConfigSlice.actions;

const reportsReducers = {
  projectReportConfig: projectReportConfigSlice.reducer,
};

export default reportsReducers;
