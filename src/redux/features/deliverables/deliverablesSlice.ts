import { createSlice } from '@reduxjs/toolkit';
import { Deliverable, SearchResponseDeliverableAdmin, SearchResponseDeliverableBase } from 'src/types/Deliverables';
import { buildReducers, StatusT } from 'src/redux/features/asyncUtils';
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

const initialStateDeliverablesSearch: { [key: string]: StatusT<DeliverablesResponseData> } = {};

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
