import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Status, StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { Observation, ObservationResultsPayload, ReplaceObservationPlotResponsePayload } from 'src/types/Observations';

import {
  requestReplaceObservationPlot,
  requestRescheduleObservation,
  requestScheduleObservation,
} from './observationsAsyncThunks';

// Define a type for the slice state
type ResultsData = {
  error?: string;
  observations?: ObservationResultsPayload[];
};

// Define the initial state
const initialResultsState: ResultsData = {};

export const observationsResultsSlice = createSlice({
  name: 'observationsResultsSlice',
  initialState: initialResultsState,
  reducers: {
    setObservationsResultsAction: (state, action: PayloadAction<ResultsData>) => {
      const data: ResultsData = action.payload;
      state.error = data.error;
      state.observations = data.observations;
    },
  },
});

export const { setObservationsResultsAction } = observationsResultsSlice.actions;
export const observationsResultsReducer = observationsResultsSlice.reducer;

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
export const observationsReducer = observationsSlice.reducer;

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
export const plantingSiteObservationsResultsReducer = plantingSiteObservationsResultsSlice.reducer;

// Schedule/Reschedule observation

type SchedulingState = Record<string, Status>;

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

export const scheduleObservationReducer = scheduleObservationSlice.reducer;
export const rescheduleObservationReducer = rescheduleObservationSlice.reducer;

// Replace observation plot

type ReplaceObservationPlotState = Record<string, StatusT<ReplaceObservationPlotResponsePayload>>;

const initialReplaceObservationPlotState: ReplaceObservationPlotState = {};

const replaceObservationPlotSlice = createSlice({
  name: 'replaceObservationPlot',
  initialState: initialReplaceObservationPlotState,
  reducers: {},
  extraReducers: buildReducers<ReplaceObservationPlotResponsePayload>(requestReplaceObservationPlot),
});

export const replaceObservationPlotReducer = replaceObservationPlotSlice.reducer;
