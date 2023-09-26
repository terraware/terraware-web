import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { requestUpdatePlantingCompleted, requestUpdatePlantingsCompleted } from './plantingsAsyncThunks';
import { buildReducers, Status } from 'src/redux/features/asyncUtils';

// Define a type for the slice state
export type PlantingSearchData = {
  id: string;
  createdTime: string;
  delivery: { withdrawal_id: string };
  'numPlants(raw)': string;
  plantingSite: { id: string };
  plantingSubzone?: { id: string; 'totalPlants(raw)': number };
  species: {
    id: string;
    scientificName: string;
    rare?: string;
    conservationCategory?: string;
  };
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

type UpdateData = Record<string, Status>;

const initialUpdateState: UpdateData = {};

const updatePlantingCompletedSlice = createSlice({
  name: 'updatePlantingCompleted',
  initialState: initialUpdateState,
  reducers: {},
  extraReducers: buildReducers(requestUpdatePlantingCompleted),
});

const updatePlantingsCompletedSlice = createSlice({
  name: 'updatePlantingsCompleted',
  initialState: initialUpdateState,
  reducers: {},
  extraReducers: buildReducers(requestUpdatePlantingsCompleted), // planting(s) plural
});

export const { setPlantingsAction } = plantingsSlice.actions;
export const plantingsReducer = plantingsSlice.reducer;

export const updatePlantingCompletedReducer = updatePlantingCompletedSlice.reducer;
export const updatePlantingsCompletedReducer = updatePlantingsCompletedSlice.reducer;
