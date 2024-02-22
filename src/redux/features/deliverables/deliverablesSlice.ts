import { createSlice } from '@reduxjs/toolkit';
import {
  Deliverable,
  SearchResponseDeliverableAdmin,
  SearchResponseDeliverableBase,
} from 'src/services/DeliverablesService';
import { buildReducers, setStatus } from 'src/redux/features/asyncUtils';
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
const initialStateDeliverable: { [key: number | string]: Deliverable } = {};

export const deliverablesSlice = createSlice({
  name: 'deliverablesSearchSlice',
  initialState: initialStateDeliverable,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(requestDeliverableFetch.pending, setStatus('pending'))
      .addCase(requestDeliverableFetch.fulfilled, (state, action) => {
        setStatus('success')(state, action);
        // Allows for the deliverable to be selected by ID
        const deliverableId = action.meta.arg.deliverableId;
        if (action.payload) {
          state[deliverableId] = action.payload;
        }
      })
      .addCase(requestDeliverableFetch.rejected, setStatus('error'));
  },
});

export const deliverablesReducer = deliverablesSlice.reducer;
