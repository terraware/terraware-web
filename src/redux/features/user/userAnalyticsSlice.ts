import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type UserAnalyticsState = {
  gtmInstrumented: boolean;
};

const initialState: UserAnalyticsState = {
  gtmInstrumented: false,
};

export const userAnalyticsSlice = createSlice({
  name: 'userAnalytics',
  initialState,
  reducers: {
    updateGtmInstrumented: (state, action: PayloadAction<UserAnalyticsState>) => {
      const userAnalyticsState = action.payload;
      state.gtmInstrumented = userAnalyticsState.gtmInstrumented;
    },
  },
});

export const { updateGtmInstrumented } = userAnalyticsSlice.actions;

const userAnalyticsReducers = {
  userAnalytics: userAnalyticsSlice.reducer,
};

export default userAnalyticsReducers;
