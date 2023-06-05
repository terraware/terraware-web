import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ObservationResults } from 'src/types/Observations';

// Define a type for the slice state
type Data = {
  error?: string;
  observations?: ObservationResults[];
};

// Define the initial state
const initialState: Data = {};

export const observationsResultsSlice = createSlice({
  name: 'observationsResultsSlice',
  initialState,
  reducers: {
    setObservationsResultsAction: (state, action: PayloadAction<Data>) => {
      const data: Data = action.payload;
      state.error = data.error;
      state.observations = data.observations;
    },
  },
});

export const { setObservationsResultsAction } = observationsResultsSlice.actions;

export const observationsResultsReducer = observationsResultsSlice.reducer;
