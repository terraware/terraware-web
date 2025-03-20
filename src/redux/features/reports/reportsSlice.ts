import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import {
  AcceleratorReport,
  ExistingAcceleratorReportConfig,
  ProjectMetric,
  StandardMetric,
} from 'src/types/AcceleratorReport';

import { StatusT, buildReducers } from '../asyncUtils';
import {
  requestCreateProjectMetric,
  requestCreateReportConfig,
  requestListAcceleratorReports,
  requestListProjectMetrics,
  requestListStandardMetrics,
  requestUpdateAcceleratorReportMetrics,
  requestUpdateProjectMetric,
  requestUpdateReportConfig,
} from './reportsThunks';

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

/**
 * Create Report Config
 */
const initialCreateReportConfigState: { [key: string]: StatusT<number> } = {};

const createReportConfigSlice = createSlice({
  name: 'createReportConfigSlice',
  initialState: initialCreateReportConfigState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestCreateReportConfig)(builder);
  },
});

/**
 * Update Report Config
 */
const initialUpdateReportConfigState: { [key: string]: StatusT<number> } = {};

const updateReportConfigSlice = createSlice({
  name: 'createReportConfigSlice',
  initialState: initialUpdateReportConfigState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateReportConfig)(builder);
  },
});

const initialListProjectMetricsState: { [key: string]: StatusT<ProjectMetric[]> } = {};

const listProjectMetricsSlice = createSlice({
  name: 'listProjectMetricsSlice',
  initialState: initialListProjectMetricsState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListProjectMetrics)(builder);
  },
});

const initialListStandardMetricsState: { [key: string]: StatusT<StandardMetric[]> } = {};

const listStandardMetricsSlice = createSlice({
  name: 'listStandardMetricsSlice',
  initialState: initialListStandardMetricsState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListStandardMetrics)(builder);
  },
});

/**
 * Create Project Metric
 */
const initialProjectMetricCreateState: { [key: string]: StatusT<number> } = {};

const projectMetricCreateSlice = createSlice({
  name: 'projectMetricCreateSlice',
  initialState: initialProjectMetricCreateState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestCreateProjectMetric)(builder);
  },
});

/**
 * Targets list
 */
const initialStateListAcceleratorReports: { [key: string]: StatusT<AcceleratorReport[]> } = {};

export const listAcceleratorReportsSlice = createSlice({
  name: 'listAcceleratorReportsSlice',
  initialState: initialStateListAcceleratorReports,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListAcceleratorReports)(builder);
  },
});

/**
 * Update Project Metric
 */
const initialProjectMetricUpdateState: { [key: string]: StatusT<number> } = {};

const projectMetricUpdateSlice = createSlice({
  name: 'projectMetricUpdateSlice',
  initialState: initialProjectMetricUpdateState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateProjectMetric)(builder);
  },
});

/**
 * Update Accelerator Report Metrics
 */
const initialUpdateAcceleratorReportMetrics: { [key: string]: StatusT<number> } = {};

const updateAcceleratorReportMetricsSlice = createSlice({
  name: 'updateAcceleratorReportMetricsSlice',
  initialState: initialUpdateAcceleratorReportMetrics,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateAcceleratorReportMetrics)(builder);
  },
});

const reportsReducers = {
  projectReportConfig: projectReportConfigSlice.reducer,
  projectReportConfigCreate: createReportConfigSlice.reducer,
  projectReportConfigUpdate: updateReportConfigSlice.reducer,
  listProjectMetrics: listProjectMetricsSlice.reducer,
  listStandardMetrics: listStandardMetricsSlice.reducer,
  projectMetricCreate: projectMetricCreateSlice.reducer,
  listAcceleratorReports: listAcceleratorReportsSlice.reducer,
  projectMetricUpdate: projectMetricUpdateSlice.reducer,
  updateAcceleratorReportMetrics: updateAcceleratorReportMetricsSlice.reducer,
};

export default reportsReducers;
