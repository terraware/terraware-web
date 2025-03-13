import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { ExistingAcceleratorReportConfig, ProjectMetric, StandardMetric } from 'src/types/AcceleratorReport';

import { StatusT, buildReducers } from '../asyncUtils';
import {
  requestCreateProjectMetric,
  requestCreateReportConfig,
  requestListProjectMetrics,
  requestListStandardMetrics,
  requestUpdateProjectMetric,
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

const reportsReducers = {
  projectReportConfig: projectReportConfigSlice.reducer,
  projectReportConfigCreate: createReportConfigSlice.reducer,
  listProjectMetrics: listProjectMetricsSlice.reducer,
  listStandardMetrics: listStandardMetricsSlice.reducer,
  projectMetricCreate: projectMetricCreateSlice.reducer,
  projectMetricUpdate: projectMetricUpdateSlice.reducer,
};

export default reportsReducers;
