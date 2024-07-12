import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { Application, ApplicationModuleWithDeliverables } from 'src/types/Application';

import { requestListApplicationModules, requestListApplications } from './applicationAsyncThunks';

/**
 * Application list
 */
const initialStateApplications: Record<string, StatusT<Application[]>> = {};

export const applicationListSlice = createSlice({
  name: 'applicationListSlice',
  initialState: initialStateApplications,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListApplications)(builder);
  },
});

/**
 * Application module list
 */
const initialStateApplicationModules: Record<string, StatusT<ApplicationModuleWithDeliverables[]>> = {};

export const applicationModuleListSlice = createSlice({
  name: 'applicationModuleListSlice',
  initialState: initialStateApplicationModules,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListApplicationModules)(builder);
  },
});

const acceleratorReducers = {
  applications: applicationListSlice.reducer,
  applicationModules: applicationModuleListSlice.reducer,
};

export default acceleratorReducers;
