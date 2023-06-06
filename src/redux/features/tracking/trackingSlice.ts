import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PlantingSite } from 'src/types/Tracking';

// Define a type for the slice state
type Data = {
  error?: string;
  plantingSites?: PlantingSite[];
};

// Define the initial state
const initialState: Data = {};

export const trackingSlice = createSlice({
  name: 'trackingSlice',
  initialState,
  reducers: {
    setPlantingSitesAction: (state, action: PayloadAction<Data>) => {
      const data: Data = action.payload;
      state.error = data.error;
      state.plantingSites = data.plantingSites;
    },
  },
});

export const { setPlantingSitesAction } = trackingSlice.actions;

export const trackingReducer = trackingSlice.reducer;
