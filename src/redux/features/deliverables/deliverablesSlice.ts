import { createSlice } from '@reduxjs/toolkit';
import { Deliverable, SearchResponseDeliverable } from 'src/types/Deliverables';
import { buildReducers, StatusT } from 'src/redux/features/asyncUtils';
import {
  requestDeliverableFetch,
  requestDeliverablesSearch,
  requestDeliverableUpdate,
} from 'src/redux/features/deliverables/deliverablesAsyncThunks';

/**
 * Deliverable list
 */
const initialStateDeliverablesSearch: { [key: string]: StatusT<SearchResponseDeliverable[]> } = {};

export const deliverablesSearchSlice = createSlice({
  name: 'deliverablesSearchSlice',
  initialState: initialStateDeliverablesSearch,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestDeliverablesSearch)(builder);
  },
});

export const deliverablesSearchReducer = deliverablesSearchSlice.reducer;

/**
 * Individual Deliverable
 */
const initialStateDeliverable: { [key: number | string]: StatusT<Deliverable> } = {};

export const deliverablesSlice = createSlice({
  name: 'deliverablesSlice',
  initialState: initialStateDeliverable,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestDeliverableFetch, true)(builder);
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
    buildReducers(requestDeliverableUpdate)(builder);
  },
});

export const deliverablesEditReducer = deliverablesEditSlice.reducer;
