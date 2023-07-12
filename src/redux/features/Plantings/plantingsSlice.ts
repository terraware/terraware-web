import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
