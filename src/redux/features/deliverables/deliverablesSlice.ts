import { createSlice } from '@reduxjs/toolkit';
import { Deliverable, DeliverablesData } from 'src/types/Deliverables';
import { buildReducers, StatusT } from 'src/redux/features/asyncUtils';
import {
  requestGetDeliverable,
  requestListDeliverables,
<<<<<<< HEAD
<<<<<<< HEAD
  requestUpdateDeliverable,
=======
  requestDeliverableUpdate,
>>>>>>> 1e4ce5e0d6 (Rewire 'list deliverables' and 'get deliverable' mocked redux to use the API from the backend)
=======
  requestUpdateDeliverable,
>>>>>>> 3c3fc3103f (Implement the update API from the backend)
} from 'src/redux/features/deliverables/deliverablesAsyncThunks';

/**
 * Deliverable list
 */
const initialStateDeliverablesList: { [key: string]: StatusT<DeliverablesData> } = {};

export const deliverablesListSlice = createSlice({
  name: 'deliverablesListSlice',
  initialState: initialStateDeliverablesList,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListDeliverables)(builder);
  },
});

export const deliverablesSearchReducer = deliverablesListSlice.reducer;

/**
 * Individual Deliverable
 */
const initialStateDeliverables: { [key: number | string]: StatusT<Deliverable> } = {};

export const deliverablesSlice = createSlice({
  name: 'deliverablesSlice',
  initialState: initialStateDeliverables,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestGetDeliverable, true)(builder);
  },
});

export const deliverablesReducer = deliverablesSlice.reducer;

/**
 * Simple OK/response for requests such as updating deliverable status, keeps
 * state of deliverable id that was edited.
 */
const initialStateEditDeliverable: { [key: number | string]: StatusT<number> } = {};

export const deliverablesEditSlice = createSlice({
  name: 'deliverablesEditSlice',
  initialState: initialStateEditDeliverable,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestUpdateDeliverable)(builder);
  },
});

export const deliverablesEditReducer = deliverablesEditSlice.reducer;
