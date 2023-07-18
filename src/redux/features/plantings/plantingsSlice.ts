import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { requestUpdatePlantingCompleted } from './plantingsAsyncThunks';

// Define a type for the slice state
export type PlantingSearchData = {
  id: string;
  createdTime: string;
  delivery: { withdrawal_id: string };
  'numPlants(raw)': string;
  plantingSite: { id: string };
  plantingSubzone: { id: string };
  species: { id: string };
  type: string;
  totalPlants: number;
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

type Status = { status: 'pending' | 'success' | 'error' };

const initialUpdateState: UpdateData = {};

export const updatePlantingCompletedSlice = createSlice({
  name: 'updatePlantingCompleted',
  initialState: initialUpdateState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(requestUpdatePlantingCompleted.pending, (state, action) => {
        const requestId = action.meta.requestId;
        state[requestId] = { status: 'pending' };
      })
      .addCase(requestUpdatePlantingCompleted.fulfilled, (state, action) => {
        const requestId = action.meta.requestId;
        state[requestId] = { status: 'success' };
      })
      .addCase(requestUpdatePlantingCompleted.rejected, (state, action) => {
        const requestId = action.meta.requestId;
        state[requestId] = { status: 'error' };
      });
  },
});

export const { setPlantingsAction } = plantingsSlice.actions;
export const plantingsReducer = plantingsSlice.reducer;

export const updatePlantingCompletedReducer = updatePlantingCompletedSlice.reducer;
