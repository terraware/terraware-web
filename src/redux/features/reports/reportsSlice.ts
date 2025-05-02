import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import {
  AcceleratorReport,
  ExistingAcceleratorReportConfig,
  ProjectMetric,
  StandardMetric,
  SystemMetric,
} from 'src/types/AcceleratorReport';

import { StatusT, buildReducers } from '../asyncUtils';
import {
  requestAcceleratorReport,
  requestCreateProjectMetric,
  requestCreateReportConfig,
  requestListAcceleratorReports,
  requestListProjectMetrics,
  requestListStandardMetrics,
  requestListSystemMetrics,
  requestPublishAcceleratorReport,
  requestRefreshAcceleratorReportSystemMetrics,
  requestReviewAcceleratorReport,
  requestReviewAcceleratorReportMetric,
  requestReviewManyAcceleratorReportMetrics,
  requestSubmitAcceleratorReport,
  requestUpdateAcceleratorReport,
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

/**
 * Get Accelerator Report
 */
const initialGetAcceleratorReportState: { [key: string]: StatusT<AcceleratorReport> } = {};
const getAcceleratorReportSlice = createSlice({
  name: 'getAcceleratorReportSlice',
  initialState: initialGetAcceleratorReportState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestAcceleratorReport)(builder);
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

const initialListSystemMetricsState: { [key: string]: StatusT<SystemMetric[]> } = {};

const listSystemMetricsSlice = createSlice({
  name: 'listSystemMetricsSlice',
  initialState: initialListSystemMetricsState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListSystemMetrics)(builder);
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
 * Update Accelerator Reports Metrics
 */
const initialReviewManyAcceleratorReportMetrics: { [key: string]: StatusT<number> } = {};

const reviewManyAcceleratorReportMetricsSlice = createSlice({
  name: 'reviewManyAcceleratorReportMetricsSlice',
  initialState: initialReviewManyAcceleratorReportMetrics,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestReviewManyAcceleratorReportMetrics)(builder);
  },
});

/**
 * Update Accelerator Report Metric
 */
const initialReviewAcceleratorReportMetric: { [key: string]: StatusT<number> } = {};

const reviewAcceleratorReportMetricSlice = createSlice({
  name: 'reviewAcceleratorReportMetricSlice',
  initialState: initialReviewAcceleratorReportMetric,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestReviewAcceleratorReportMetric)(builder);
  },
});

/**
 * Update Accelerator Reports
 */
const initialUpdateManyAcceleratorReports: { [key: string]: StatusT<number> } = {};

const updateManyAcceleratorReportsSlice = createSlice({
  name: 'updateManyAcceleratorReportsSlice',
  initialState: initialUpdateManyAcceleratorReports,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestReviewManyAcceleratorReportMetrics)(builder);
  },
});

/**
 * Update Accelerator Report
 */
const initialReviewAcceleratorReport: { [key: string]: StatusT<number> } = {};

const reviewAcceleratorReportSlice = createSlice({
  name: 'reviewAcceleratorReportSlice',
  initialState: initialReviewAcceleratorReport,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestReviewAcceleratorReport)(builder);
  },
});

/**
 * Refresh Accelerator Report System Metric value
 */
const initialRefreshAcceleratorReportSystemMetricsState: { [key: string]: StatusT<number> } = {};

const refreshAcceleratorReportSystemMetricsSlice = createSlice({
  name: 'refreshAcceleratorReportSystemMetricsSlice',
  initialState: initialRefreshAcceleratorReportSystemMetricsState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestRefreshAcceleratorReportSystemMetrics)(builder);
  },
});

/**
 * Update Accelerator Report Values
 */
const initialUpdateAcceleratorReport: { [key: string]: StatusT<number> } = {};

const updateAcceleratorReportSlice = createSlice({
  name: 'updateAcceleratorReportSlice',
  initialState: initialUpdateAcceleratorReport,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateAcceleratorReport)(builder);
  },
});

/**
 * Submit Accelerator Report
 */
const initialSubmitAcceleratorReport: { [key: string]: StatusT<number> } = {};
const submitAcceleratorReportSlice = createSlice({
  name: 'submitAcceleratorReportSlice',
  initialState: initialSubmitAcceleratorReport,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestSubmitAcceleratorReport)(builder);
  },
});

/**
 * Publish Accelerator Report
 */
const initialPublishAcceleratorReport: { [key: string]: StatusT<number> } = {};
const publishAcceleratorReportSlice = createSlice({
  name: 'publishAcceleratorReportSlice',
  initialState: initialPublishAcceleratorReport,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestPublishAcceleratorReport)(builder);
  },
});

const reportsReducers = {
  getAcceleratorReport: getAcceleratorReportSlice.reducer,
  projectReportConfig: projectReportConfigSlice.reducer,
  projectReportConfigCreate: createReportConfigSlice.reducer,
  projectReportConfigUpdate: updateReportConfigSlice.reducer,
  listProjectMetrics: listProjectMetricsSlice.reducer,
  listStandardMetrics: listStandardMetricsSlice.reducer,
  listSystemMetrics: listSystemMetricsSlice.reducer,
  projectMetricCreate: projectMetricCreateSlice.reducer,
  listAcceleratorReports: listAcceleratorReportsSlice.reducer,
  projectMetricUpdate: projectMetricUpdateSlice.reducer,
  reviewManyAcceleratorReportMetrics: reviewManyAcceleratorReportMetricsSlice.reducer,
  reviewAcceleratorReportMetric: reviewAcceleratorReportMetricSlice.reducer,
  reviewAcceleratorReport: reviewAcceleratorReportSlice.reducer,
  refreshAcceleratorReportSystemMetrics: refreshAcceleratorReportSystemMetricsSlice.reducer,
  submitAcceleratorReport: submitAcceleratorReportSlice.reducer,
  updateAcceleratorReport: updateAcceleratorReportSlice.reducer,
  updateManyAcceleratorReports: updateManyAcceleratorReportsSlice.reducer,
  publishAcceleratorReport: publishAcceleratorReportSlice.reducer,
};

export default reportsReducers;
