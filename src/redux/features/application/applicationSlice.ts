import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { Application, ApplicationDeliverable, ApplicationModule } from 'src/types/Application';

import {
  requestListApplicationDeliverables,
  requestListApplicationModules,
  requestListApplications,
} from './applicationAsyncThunks';

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
 * Application deliverable list
 */
const initialStateApplicationDeliverables: Record<string, StatusT<ApplicationDeliverable[]>> = {};

export const applicationDeliverablesListSlice = createSlice({
  name: 'applicationDeliverablesListSlice',
  initialState: initialStateApplicationDeliverables,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListApplicationDeliverables)(builder);
  },
});

/**
 * Application module list
 */
const initialStateApplicationModules: Record<string, StatusT<ApplicationModule[]>> = {};

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
  applicationDeliverables: applicationDeliverablesListSlice.reducer,
  applicationModules: applicationModuleListSlice.reducer,
};

export default acceleratorReducers;
