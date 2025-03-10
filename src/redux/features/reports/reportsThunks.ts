import { createAsyncThunk } from '@reduxjs/toolkit';
import { Dispatch } from 'redux';

import { RootState } from 'src/redux/rootReducer';
import AcceleratorReportService from 'src/services/AcceleratorReportService';
import strings from 'src/strings';
import { CreateAcceleratorReportConfigRequest } from 'src/types/AcceleratorReport';

import { setProjectReportConfigAction } from './reportsSlice';

export const requestProjectReportConfig = (projectId: number) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    try {
      const response = await AcceleratorReportService.getAcceleratorReportConfig(projectId);
      dispatch(setProjectReportConfigAction({ config: response.config }));
    } catch (e) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      console.error('Error dispatching project report config', e);
    }
  };
};

export const requestCreateReportConfig = createAsyncThunk(
  'createReportConfig',
  async (request: CreateAcceleratorReportConfigRequest, { rejectWithValue }) => {
    const response = await AcceleratorReportService.createConfig(request);

    if (response && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
