import { PayloadAction, createSlice } from '@reduxjs/toolkit';

// Define a type for the slice state
interface AppVersionState {
  version?: string;
}

// Define the initial state using that type
const initialState: AppVersionState = {};

export const appVersionSlice = createSlice({
  name: 'appVersion',
  initialState,
  reducers: {
    setVersionAction: (state, action: PayloadAction<string>) => {
      state.version = action.payload;
    },
  },
});

export const { setVersionAction } = appVersionSlice.actions;

export const appVersionReducer = appVersionSlice.reducer;
