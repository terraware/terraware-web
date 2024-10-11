import { createSlice } from '@reduxjs/toolkit';

import { ModuleEvent } from 'src/types/Module';

import { StatusT, buildReducers } from '../asyncUtils';
import { requestCreateModuleEvent, requestGetEvent, requestListEvents } from './eventsAsyncThunks';

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

/**
 * Create Module Event
 */
const initialCreateModuleEventState: { [key: string]: StatusT<number> } = {};

const createModuleEventSlice = createSlice({
  name: 'createModuleEventSlice',
  initialState: initialCreateModuleEventState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestCreateModuleEvent)(builder);
  },
});

const initialEventProjectsUpdateState: { [key: string]: StatusT<number> } = {};

const eventProjectsUpdateSlice = createSlice({
  name: 'eventProjectsUpdateSlice',
  initialState: initialEventProjectsUpdateState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestCreateModuleEvent)(builder);
  },
});

const eventReducers = {
  event: eventSlice.reducer,
  eventList: eventListSlice.reducer,
  eventCreate: createModuleEventSlice.reducer,
  eventProjectsUpdate: eventProjectsUpdateSlice.reducer,
};

export default eventReducers;
