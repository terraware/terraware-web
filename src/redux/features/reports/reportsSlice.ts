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
 * List Accelerator Reports
 */
const initialListAcceleratorReportsState: { [key: string]: StatusT<AcceleratorReport[]> } = {};

const listAcceleratorReportsSlice = createSlice({
  name: 'listAcceleratorReportsSlice',
  initialState: initialListAcceleratorReportsState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListAcceleratorReports)(builder);
  },
});

const reportsReducers = {
  projectReportConfig: projectReportConfigSlice.reducer,
  projectReportConfigCreate: createReportConfigSlice.reducer,
  projectReportConfigUpdate: updateReportConfigSlice.reducer,
  listAcceleratorReports: listAcceleratorReportsSlice.reducer,
  listProjectMetrics: listProjectMetricsSlice.reducer,
  listStandardMetrics: listStandardMetricsSlice.reducer,
  projectMetricCreate: projectMetricCreateSlice.reducer,
  projectMetricUpdate: projectMetricUpdateSlice.reducer,
};

export default reportsReducers;
