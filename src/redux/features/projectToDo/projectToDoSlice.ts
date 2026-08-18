import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { DeliverableToDoItem } from 'src/types/DeliverableToDoItem';
import { EventToDoItem } from 'src/types/ProjectToDo';

import { requestProjectToDoDeliverables, requestProjectToDoEvents } from './projectToDoAsyncThunk';

/**
 * List To Do Deliverables
 */
const initialStateProjectToDoDeliverables: { [key: string]: StatusT<DeliverableToDoItem[]> } = {};

const deliverablesToDoListSlice = createSlice({
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

const eventsToDoListSlice = createSlice({
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
