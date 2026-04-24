import { createSlice } from '@reduxjs/toolkit';

import { AsyncRequest, buildReducers } from 'src/redux/features/asyncUtils';

import { requestRescheduleObservation, requestScheduleObservation } from './observationsAsyncThunks';

// Schedule/Reschedule observation

type SchedulingState = Record<string, AsyncRequest>;

const initialSchedulingState: SchedulingState = {};

const scheduleObservationSlice = createSlice({
  name: 'scheduleObservation',
  initialState: initialSchedulingState,
  reducers: {},
  extraReducers: buildReducers(requestScheduleObservation),
});

const rescheduleObservationSlice = createSlice({
  name: 'rescheduleObservation',
  initialState: initialSchedulingState,
  reducers: {},
  extraReducers: buildReducers(requestRescheduleObservation),
});

const observationsReducers = {
  scheduleObservation: scheduleObservationSlice.reducer,
  rescheduleObservation: rescheduleObservationSlice.reducer,
};

export default observationsReducers;
