import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { FunderActivity } from 'src/types/FunderActivity';

import { requestListFunderActivities } from './funderActivitiesAsyncThunks';

const initialStateFunderActivities: { [requestId: string]: StatusT<FunderActivity[]> } = {};

export const funderActivitiesSlice = createSlice({
  name: 'funderActivitiesSlice',
  initialState: initialStateFunderActivities,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListFunderActivities, true)(builder);
  },
});

const funderActivitiesReducers = {
  funderActivities: funderActivitiesSlice.reducer,
};

export default funderActivitiesReducers;
