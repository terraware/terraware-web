import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Observation, ObservationResultsPayload } from 'src/types/Observations';
import { requestScheduleObservation, requestRescheduleObservation } from './observationsAsyncThunks';
import { buildReducers, Status } from 'src/redux/features/asyncUtils';

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
