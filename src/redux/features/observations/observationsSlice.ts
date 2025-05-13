import { createSlice } from '@reduxjs/toolkit';

import { AsyncRequest, StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import {
  Observation,
  ObservationResultsPayload,
  ObservationSummary,
  ReplaceObservationPlotResponsePayload,
} from 'src/types/Observations';

import {
  requestAbandonObservation,
  requestReplaceObservationPlot,
  requestRescheduleObservation,
  requestScheduleObservation,
} from './observationsAsyncThunks';
import {
  requestOrganizationAdHocObservationResults,
  requestOrganizationAdHocObservations,
  requestOrganizationObservationResults,
  requestOrganizationObservations,
  requestPlantingSiteAdHocObservationResults,
  requestPlantingSiteAdHocObservations,
  requestPlantingSiteObservationResults,
  requestPlantingSiteObservationSummaries,
  requestPlantingSiteObservations,
} from './observationsThunks';

// Schedule/Reschedule observation
type SchedulingState = Record<string, AsyncRequest>;

const initialSchedulingState: SchedulingState = {};

const scheduleObservationSlice = createSlice({
  name: 'scheduleObservation',
  initialState: initialSchedulingState,
  reducers: {},
  extraReducers: buildReducers(requestScheduleObservation),
});

const rescheduleObservationSlice = createSlice({
  name: 'rescheduleObservation',
  initialState: initialSchedulingState,
  reducers: {},
  extraReducers: buildReducers(requestRescheduleObservation),
});

// Replace observation plot

type ReplaceObservationPlotState = Record<string, StatusT<ReplaceObservationPlotResponsePayload>>;

const initialReplaceObservationPlotState: ReplaceObservationPlotState = {};

const replaceObservationPlotSlice = createSlice({
  name: 'replaceObservationPlot',
  initialState: initialReplaceObservationPlotState,
  reducers: {},
  extraReducers: buildReducers<ReplaceObservationPlotResponsePayload>(requestReplaceObservationPlot),
});

// Abandon observation

type AbandonObservationState = Record<string, AsyncRequest>;

const initialAbandonObservationState: AbandonObservationState = {};

const abandonObservationSlice = createSlice({
  name: 'abandonObservation',
  initialState: initialAbandonObservationState,
  reducers: {},
  extraReducers: buildReducers(requestAbandonObservation),
});


const initialStateObservations: { [key: string]: StatusT<Observation[]> } = {};
const initialStateObservationResults: { [key: string]: StatusT<ObservationResultsPayload[]> } = {};

// Organization observations

export const organizationObservationsSlice = createSlice({
  name: 'organizationObservationsSlice',
  initialState: initialStateObservations,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestOrganizationObservations)(builder);
  },
});
export const organizationObservationResultsSlice = createSlice({
  name: 'organizationObservationResultsSlice',
  initialState: initialStateObservationResults,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestOrganizationObservationResults)(builder);
  },
});
export const organizationAdHocObservationsSlice = createSlice({
  name: 'organizationAdHocObservationsSlice',
  initialState: initialStateObservations,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestOrganizationAdHocObservations)(builder);
  },
});
export const organizationAdHocObservationResultsSlice = createSlice({
  name: 'organizationAdHocObservationResultsSlice',
  initialState: initialStateObservationResults,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestOrganizationAdHocObservationResults)(builder);
  },
});

// Planting site observations

export const plantingSiteObservationsSlice = createSlice({
  name: 'plantingSiteObservationsSlice',
  initialState: initialStateObservations,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestPlantingSiteObservations)(builder);
  },
});

export const plantingSiteObservationResultsSlice = createSlice({
  name: 'plantingSiteObservationResultsSlice',
  initialState: initialStateObservationResults,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestPlantingSiteObservationResults)(builder);
  },
});

export const plantingSiteAdHocObservationsSlice = createSlice({
  name: 'plantingSiteAdHocObservationsSlice',
  initialState: initialStateObservations,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestPlantingSiteAdHocObservations)(builder);
  },
});

export const plantingSiteAdHocObservationResultsSlice = createSlice({
  name: 'plantingSiteAdHocObservationResultsSlice',
  initialState: initialStateObservationResults,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestPlantingSiteAdHocObservationResults)(builder);
  },
});

const initialStatePlantingSiteObservationsSummaries: { [key: string]: StatusT<ObservationSummary[]> } = {};
export const plantingSiteObservationsSummariesSlice = createSlice({
  name: 'plantingSiteObservationsSummariesSlice',
  initialState: initialStatePlantingSiteObservationsSummaries,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestPlantingSiteObservationSummaries)(builder);
  },
});

const observationsReducers = {
  scheduleObservation: scheduleObservationSlice.reducer,
  rescheduleObservation: rescheduleObservationSlice.reducer,
  replaceObservationPlot: replaceObservationPlotSlice.reducer,
  abandonObservation: abandonObservationSlice.reducer,
  organizationObservationResults: organizationObservationResultsSlice.reducer,
  organizationObservations: organizationObservationsSlice.reducer,
  organizationAdHocObservationResults: organizationAdHocObservationResultsSlice.reducer,
  organizationAdHocObservations: organizationAdHocObservationsSlice.reducer,
  plantingSiteObservationResults: plantingSiteObservationResultsSlice.reducer,
  plantingSiteObservations: plantingSiteObservationsSlice.reducer,
  plantingSiteAdHocObservationResults: plantingSiteAdHocObservationResultsSlice.reducer,
  plantingSiteAdHocObservations: plantingSiteAdHocObservationsSlice.reducer,
  plantingSiteObservationsSummaries: plantingSiteObservationsSummariesSlice.reducer,
};

export default observationsReducers;
