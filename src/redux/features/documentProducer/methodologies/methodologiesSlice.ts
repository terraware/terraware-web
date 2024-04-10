import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Methodology } from 'src/types/documentProducer/Methodology';

// Define a type for the slice state
export type MethodologiesData = {
  methodologies?: Methodology[];
  error?: string;
};

// Define the initial state
export type MethodologiesState = {
  listMethodologies: MethodologiesData;
};

const initialState: MethodologiesState = {
  listMethodologies: {},
};

const methodologiesSlice = createSlice({
  name: 'methodologiesSlice',
  initialState,
  reducers: {
    setMethodologies: (state, action: PayloadAction<MethodologiesData>) => {
      const data: MethodologiesData = action.payload;
      state.listMethodologies = { ...data };
    },
  },
});

export const { setMethodologies } = methodologiesSlice.actions;

export const documentProducerMethodologiesReducers = {
  documentProducerMethodologies: methodologiesSlice.reducer,
};
