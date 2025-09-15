import { PayloadAction, createSlice } from '@reduxjs/toolkit';

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
  requestOneObservation,
  requestOneObservationResult,
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

// Define a type for the slice state
type ResultsData = {
  error?: string;
  observations?: ObservationResultsPayload[];
  organizationId?: number;
};

// Define the initial state
const initialResultsState: { [organizationId: string]: StatusT<ResultsData> } & ResultsData = {};

export const observationsResultsSlice = createSlice({
  name: 'observationsResultsSlice',
  initialState: initialResultsState,
  reducers: {
    setObservationsResultsAction: (state, action: PayloadAction<ResultsData>) => {
      const data: ResultsData = action.payload;
      state.error = data.error;
      state.observations = data.observations;
      state.organizationId = data.organizationId;
      if (data.organizationId) {
        state[data.organizationId.toString()] = {
          status: 'success',
          data,
        };
      }
    },
  },
});

export const { setObservationsResultsAction } = observationsResultsSlice.actions;

// Define a type for the slice state
type Data = {
  error?: string;
  observations?: Observation[];
};

// Define the initial state
const initialState: Data = {};

export const observationsSlice = createSlice({
  name: 'observationsSlice',
  initialState,
  reducers: {
    setObservationsAction: (state, action: PayloadAction<Data>) => {
      const data: Data = action.payload;
      state.error = data.error;
      state.observations = data.observations;
    },
  },
});

export const { setObservationsAction } = observationsSlice.actions;

export const adHocObservationsSlice = createSlice({
  name: 'adHocObservationsSlice',
  initialState,
  reducers: {
    setAdHocObservationsAction: (state, action: PayloadAction<Data>) => {
      const data: Data = action.payload;
      state.error = data.error;
      state.observations = data.observations;
    },
  },
});

export const { setAdHocObservationsAction } = adHocObservationsSlice.actions;

type PlantingSitePayload = {
  plantingSiteId: number;
  data: ResultsData;
};

type PlantingSiteData = Record<number, ResultsData>;

const plantingSiteInitialResultsState: PlantingSiteData = {};

const plantingSiteObservationsResultsSlice = createSlice({
  name: 'plantingSiteObservationsResultsSlice',
  initialState: plantingSiteInitialResultsState,
  reducers: {
    setPlantingSiteObservationsResultsAction: (state, action: PayloadAction<PlantingSitePayload>) => {
      const data: ResultsData = action.payload.data;
      state[action.payload.plantingSiteId] = data;
    },
  },
});

export const { setPlantingSiteObservationsResultsAction } = plantingSiteObservationsResultsSlice.actions;

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

// Define a type for the slice state
type AdHocResultsData = {
  error?: string;
  observations?: ObservationResultsPayload[];
};

// Define the initial state
const initialAdHocResultsState: AdHocResultsData = {};

export const adHocObservationResultsSlice = createSlice({
  name: 'adHocobservationResultsSlice',
  initialState: initialAdHocResultsState,
  reducers: {
    setAdHocObservationResultsAction: (state, action: PayloadAction<AdHocResultsData>) => {
      const data: AdHocResultsData = action.payload;
      state.error = data.error;
      state.observations = data.observations;
    },
  },
});

export const { setAdHocObservationResultsAction } = adHocObservationResultsSlice.actions;

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

// Get One
const initialStateGetOneObservation: { [key: string]: StatusT<Observation> } = {};
export const getOneObservationSlice = createSlice({
  name: 'getOneObservationSlice',
  initialState: initialStateGetOneObservation,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestOneObservation)(builder);
  },
});

const initialStateGetOneObservationResults: { [key: string]: StatusT<ObservationResultsPayload> } = {};
export const getOneObservationResultsSlice = createSlice({
  name: 'getOneObservationResultSlice',
  initialState: initialStateGetOneObservationResults,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestOneObservationResult)(builder);
  },
});

const observationsReducers = {
  observationsResults: observationsResultsSlice.reducer,
  observations: observationsSlice.reducer,
  oneObservation: getOneObservationSlice.reducer,
  oneObservationResults: getOneObservationResultsSlice.reducer,
  adHocObservations: adHocObservationsSlice.reducer,
  plantingSiteObservationsResults: plantingSiteObservationsResultsSlice.reducer,
  scheduleObservation: scheduleObservationSlice.reducer,
  rescheduleObservation: rescheduleObservationSlice.reducer,
  replaceObservationPlot: replaceObservationPlotSlice.reducer,
  abandonObservation: abandonObservationSlice.reducer,
  adHocObservationResults: adHocObservationResultsSlice.reducer,
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
