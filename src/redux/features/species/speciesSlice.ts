import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Species } from 'src/types/Species';

// Define a type for the slice state
type Data = {
  error?: string;
  species?: Species[];
};

// Define the initial state
const initialState: Data = {};

export const speciesSlice = createSlice({
  name: 'speciesSlice',
  initialState,
  reducers: {
    setSpeciesAction: (state, action: PayloadAction<Data>) => {
      const data: Data = action.payload;
      state.error = data.error;
      state.species = data.species;
    },
  },
});

export const { setSpeciesAction } = speciesSlice.actions;

export const speciesReducer = speciesSlice.reducer;
