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
import { requestGetPlantingSiteObservationsSummaries } from './observationsThunks';

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

const initialStatePlantingSiteObservationsSummaries: { [key: string]: StatusT<ObservationSummary[]> } = {};

export const plantingSiteObservationsSummariesSlice = createSlice({
  name: 'plantingSiteObservationsSummariesSlice',
  initialState: initialStatePlantingSiteObservationsSummaries,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetPlantingSiteObservationsSummaries)(builder);
  },
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

export const adHocObservationsResultsSlice = createSlice({
  name: 'adHocobservationsResultsSlice',
  initialState: initialAdHocResultsState,
  reducers: {
    setAdHocObservationsResultsAction: (state, action: PayloadAction<AdHocResultsData>) => {
      const data: AdHocResultsData = action.payload;
      state.error = data.error;
      state.observations = data.observations;
    },
  },
});

export const { setAdHocObservationsResultsAction } = adHocObservationsResultsSlice.actions;

const observationsReducers = {
  observationsResults: observationsResultsSlice.reducer,
  observations: observationsSlice.reducer,
  adHocObservations: adHocObservationsSlice.reducer,
  plantingSiteObservationsResults: plantingSiteObservationsResultsSlice.reducer,
  scheduleObservation: scheduleObservationSlice.reducer,
  rescheduleObservation: rescheduleObservationSlice.reducer,
  replaceObservationPlot: replaceObservationPlotSlice.reducer,
  plantingSiteObservationsSummaries: plantingSiteObservationsSummariesSlice.reducer,
  abandonObservation: abandonObservationSlice.reducer,
  adHocObservationsResults: adHocObservationsResultsSlice.reducer,
};

export default observationsReducers;
