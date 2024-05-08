import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { DeliverableToDoItem, EventToDoItem } from 'src/types/ProjectToDo';

import { requestProjectToDoDeliverables, requestProjectToDoEvents } from './projectToDoAsyncThunk';

/**
 * List To Do Deliverables
 */
const initialStateProjectToDoDeliverables: { [key: string]: StatusT<DeliverableToDoItem[]> } = {};

export const deliverablesToDoListSlice = createSlice({
  name: 'projectToDoDeliverablesSlice',
  initialState: initialStateProjectToDoDeliverables,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestProjectToDoDeliverables, true)(builder);
  },
});

/**
 * List To Do Events
 */
const initialStateProjectToDoEvents: { [key: string]: StatusT<EventToDoItem[]> } = {};

export const eventsToDoListSlice = createSlice({
  name: 'projectToDoEventsSlice',
  initialState: initialStateProjectToDoEvents,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestProjectToDoEvents, true)(builder);
  },
});

const projectToDoReducers = {
  projectToDoDeliverables: deliverablesToDoListSlice.reducer,
  projectToDoEvents: eventsToDoListSlice.reducer,
};

export default projectToDoReducers;
