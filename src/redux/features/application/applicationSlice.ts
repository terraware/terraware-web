import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { Application, ApplicationDeliverable, ApplicationHistory, ApplicationModule } from 'src/types/Application';

import {
  requestCreateApplication,
  requestCreateProjectApplication,
  requestListApplicationDeliverables,
  requestListApplicationHistory,
  requestListApplicationModules,
  requestListApplications,
  requestRestartApplication,
  requestReviewApplication,
  requestSubmitApplication,
  requestUpdateApplicationBoundary,
  requestUploadApplicationBoundary,
} from './applicationAsyncThunks';

/**
 * Application create
 */
const initialStateApplicationCreate: Record<string, StatusT<number>> = {};

export const applicationCreateSlice = createSlice({
  name: 'applicationCreateSlice',
  initialState: initialStateApplicationCreate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestCreateApplication)(builder);
  },
});

/**
 * Application create project
 */
const initialStateApplicationProjectCreate: Record<string, StatusT<number>> = {};

export const applicationProjectCreateSlice = createSlice({
  name: 'applicationProjectCreateSlice',
  initialState: initialStateApplicationProjectCreate,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestCreateProjectApplication)(builder);
  },
});

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
 * Application history list
 */
const initialStateApplicationHistory: Record<string, StatusT<ApplicationHistory[]>> = {};

export const applicationHistoryListSlice = createSlice({
  name: 'applicationHistoryListSlice',
  initialState: initialStateApplicationHistory,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListApplicationHistory)(builder);
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

/**
 * Application restart
 */
const initialStateApplicationRestart: Record<string, StatusT<Response>> = {};

export const applicationRestartSlice = createSlice({
  name: 'applicationRestartSlice',
  initialState: initialStateApplicationRestart,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestRestartApplication)(builder);
  },
});

/**
 * Application submit
 */
const initialStateApplicationSubmit: Record<string, StatusT<string[]>> = {};

export const applicationSubmitSlice = createSlice({
  name: 'applicationSubmitSlice',
  initialState: initialStateApplicationSubmit,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestSubmitApplication)(builder);
  },
});

/**
 * Application review
 */
const initialStateApplicationReview: Record<string, StatusT<Response>> = {};

export const applicationReviewSlice = createSlice({
  name: 'applicationReviewSlice',
  initialState: initialStateApplicationReview,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestReviewApplication)(builder);
  },
});

/**
 * Application update boundary
 */
const initialStateApplicationUpdateBoundary: Record<string, StatusT<Response>> = {};

export const applicationUpdateBoundarySlice = createSlice({
  name: 'applicationUpdateBoundarySlice',
  initialState: initialStateApplicationUpdateBoundary,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateApplicationBoundary)(builder);
  },
});

/**
 * Application upload boundary
 */
const initialStateApplicationUploadBoundary: Record<string, StatusT<Response>> = {};

export const applicationUploadBoundarySlice = createSlice({
  name: 'applicationUploadBoundarySlice',
  initialState: initialStateApplicationUploadBoundary,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUploadApplicationBoundary)(builder);
  },
});

const acceleratorReducers = {
  applications: applicationListSlice.reducer,
  applicationCreate: applicationCreateSlice.reducer,
  applicationCreateProject: applicationProjectCreateSlice.reducer,
  applicationDeliverables: applicationDeliverablesListSlice.reducer,
  applicationHistory: applicationHistoryListSlice.reducer,
  applicationModules: applicationModuleListSlice.reducer,
  applicationRestart: applicationRestartSlice.reducer,
  applicationReview: applicationReviewSlice.reducer,
  applicationSubmit: applicationSubmitSlice.reducer,
  applicationUpdateBoundary: applicationUpdateBoundarySlice.reducer,
  applicationUploadBoundary: applicationUploadBoundarySlice.reducer,
};

export default acceleratorReducers;
