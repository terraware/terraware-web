import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type UserState = {
  gtmInstrumented: boolean;
};

const initialState: UserState = {
  gtmInstrumented: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateGtmInstrumented: (state, action: PayloadAction<UserState>) => {
      const userState = action.payload;
      state.gtmInstrumented = userState.gtmInstrumented;
    },
  },
});

export const { updateGtmInstrumented } = userSlice.actions;

export const userReducer = userSlice.reducer;
