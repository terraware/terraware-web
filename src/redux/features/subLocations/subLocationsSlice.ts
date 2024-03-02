import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { SubLocation } from 'src/types/Facility';

// Define a type for the slice state
type Data = {
  errors?: string[];
  subLocations?: SubLocation[];
};

// Define the initial state
const initialState: Data = {};

export const subLocationsSlice = createSlice({
  name: 'subLocationsSlice',
  initialState,
  reducers: {
    setSubLocationsAction: (state, action: PayloadAction<Data>) => {
      const data: Data = action.payload;
      state.errors = data.errors;
      state.subLocations = data.subLocations;
    },
  },
});

export const { setSubLocationsAction } = subLocationsSlice.actions;
export const subLocationsReducer = subLocationsSlice.reducer;
