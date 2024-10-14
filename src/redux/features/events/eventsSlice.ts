import { createSlice } from '@reduxjs/toolkit';

import { ModuleEvent } from 'src/types/Module';

import { StatusT, buildReducers } from '../asyncUtils';
import {
  requestCreateModuleEvent,
  requestEventDelete,
  requestEventDeleteMany,
  requestEventUpdate,
  requestGetEvent,
  requestListEvents,
} from './eventsAsyncThunks';

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

/**
 * Delete Module Event
 */
const initialDeleteModuleEventState: { [key: string]: StatusT<boolean> } = {};

const deleteModuleEventSlice = createSlice({
  name: 'deleteModuleEventSlice',
  initialState: initialDeleteModuleEventState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestEventDelete)(builder);
  },
});

/**
 * Update Module Event
 */
const initialUpdateModuleEventState: { [key: string]: StatusT<boolean> } = {};

const updateModuleEventSlice = createSlice({
  name: 'updateModuleEventSlice',
  initialState: initialUpdateModuleEventState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestEventUpdate)(builder);
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

/**
 * Deletes many events
 */
const initialStateEventDeleteMany: { [key: string]: StatusT<boolean> } = {};

export const eventDeleteManySlice = createSlice({
  name: 'eventDeleteManySlice',
  initialState: initialStateEventDeleteMany,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestEventDeleteMany)(builder);
  },
});

const eventReducers = {
  event: eventSlice.reducer,
  eventList: eventListSlice.reducer,
  eventCreate: createModuleEventSlice.reducer,
  eventDelete: deleteModuleEventSlice.reducer,
  eventUpdate: updateModuleEventSlice.reducer,
  eventProjectsUpdate: eventProjectsUpdateSlice.reducer,
  eventDeleteMany: eventDeleteManySlice.reducer,
};

export default eventReducers;
