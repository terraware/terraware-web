import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PlantingSiteReportedPlants } from 'src/types/PlantingSite';

// Define a type for the slice state
type PlantingSearchData = {
  id: string;
  createdTime: string;
  delivery: { withdrawal_id: string };
  'numPlants(raw)': string;
  plantingSite: { id: string };
  plantingSubzone: { id: string };
  species: { id: string };
  type: string;
};

type Data = {
  plantings?: PlantingSearchData[];
};

// Define the initial state
const initialState: Data = {};

export const plantingsSlice = createSlice({
  name: 'plantingsSlice',
  initialState,
  reducers: {
    setPlantingsAction: (state, action: PayloadAction<Data>) => {
      const data: Data = action.payload;
      state.plantings = data.plantings;
    },
  },
});

export const { setPlantingsAction } = plantingsSlice.actions;

export const plantingsReducer = plantingsSlice.reducer;

// Define a type for the slice state
type PlantingSiteData = {
  error?: string;
  site?: PlantingSiteReportedPlants;
};

// Define the initial state
const initialPlantingSiteState: PlantingSiteData = {};

export const plantingSiteReportedPlantsSlice = createSlice({
  name: 'plantingSiteReportedPlantsSlice',
  initialState: initialPlantingSiteState,
  reducers: {
    setPlantingSiteReportedPlantsAction: (state, action: PayloadAction<PlantingSiteData>) => {
      const data: PlantingSiteData = action.payload;
      state.error = data.error;
      state.site = data.site;
    },
  },
});

export const { setPlantingSiteReportedPlantsAction } = plantingSiteReportedPlantsSlice.actions;
export const plantingSiteReportedPlantsReducer = plantingSiteReportedPlantsSlice.reducer;
