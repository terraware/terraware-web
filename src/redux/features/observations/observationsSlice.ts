import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Observation, ObservationResultsPayload } from 'src/types/Observations';

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
