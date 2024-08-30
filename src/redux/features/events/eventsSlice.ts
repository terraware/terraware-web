import { createSlice } from '@reduxjs/toolkit';

import { ModuleEvent } from 'src/types/Module';

import { StatusT, buildReducers } from '../asyncUtils';
import { requestGetEvent, requestListEvents } from './eventsAsyncThunks';

/**
 * Get Event
 */
const initialStateEvent: { [key: string]: StatusT<ModuleEvent> } = {};

export const eventSlice = createSlice({
  name: 'eventSlice',
  initialState: initialStateEvent,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetEvent)(builder);
  },
});

/**
 * List Events
 */
const initialStateEventsList: { [key: string]: StatusT<ModuleEvent[]> } = {};

export const eventListSlice = createSlice({
  name: 'eventListSlice',
  initialState: initialStateEventsList,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListEvents)(builder);
  },
});

const eventReducers = {
  event: eventSlice.reducer,
  eventList: eventListSlice.reducer,
};

export default eventReducers;
