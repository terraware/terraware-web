import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import {
  requestGetDeliverable,
  requestListDeliverables,
  requestUpdateDeliverable,
  requestUploadDeliverableDocument,
} from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { Deliverable, DeliverablesData } from 'src/types/Deliverables';

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
    buildReducers(requestGetDeliverable)(builder);
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
    buildReducers(requestUploadDeliverableDocument)(builder);
  },
});

export const deliverablesEditReducer = deliverablesEditSlice.reducer;
