import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { AsyncRequest, buildReducers } from 'src/redux/features/asyncUtils';

import { requestUpdatePlantingCompleted, requestUpdatePlantingsCompleted } from './plantingsAsyncThunks';

// Define a type for the slice state
export type PlantingSearchData = {
  id: string;
  createdTime: string;
  delivery: { withdrawal_id: string };
  'numPlants(raw)': string;
  plantingSite: { id: string };
  substratum?: { id: string; 'totalPlants(raw)': number };
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

type UpdateData = Record<string, AsyncRequest>;

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

const plantingsReducers = {
  plantings: plantingsSlice.reducer,
  updatePlantingCompleted: updatePlantingCompletedSlice.reducer,
  updatePlantingsCompleted: updatePlantingsCompletedSlice.reducer,
};

export default plantingsReducers;
