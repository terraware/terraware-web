import { createSlice } from '@reduxjs/toolkit';
import {
  Deliverable,
  SearchResponseDeliverableAdmin,
  SearchResponseDeliverableBase,
} from 'src/services/DeliverablesService';
import { buildReducers, setStatus, Statuses } from 'src/redux/features/asyncUtils';
import {
  requestDeliverableFetch,
  requestDeliverablesSearch,
} from 'src/redux/features/deliverables/deliverablesAsyncThunks';

/**
 * Deliverable list
 */
export type DeliverablesResponseData = {
  error?: string | true;
  deliverables?: (SearchResponseDeliverableAdmin | SearchResponseDeliverableBase)[];
};

const initialStateDeliverablesSearch: { [key: string]: DeliverablesResponseData } = {};

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
const initialStateDeliverable: { [key: number | string]: { status: Statuses; data: Deliverable } } = {};

export const deliverablesSlice = createSlice({
  name: 'deliverablesSearchSlice',
  initialState: initialStateDeliverable,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestDeliverableFetch, true)(builder);
  },
});

export const deliverablesReducer = deliverablesSlice.reducer;
