import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers, setStatus } from 'src/redux/features/asyncUtils';
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
 * Can be accessed by a request ID or by a deliverable/project ID string
 */
const initialStateDeliverables: { [key: number | string]: StatusT<Deliverable> } = {};
export const makeDeliverableProjectIdKey = (deliverableId: number, projectId: number) =>
  `d${deliverableId}-p${projectId}`;

export const deliverablesSlice = createSlice({
  name: 'deliverablesSlice',
  initialState: initialStateDeliverables,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(requestGetDeliverable.pending, setStatus('pending'))
      .addCase(requestGetDeliverable.fulfilled, (state, action) => {
        setStatus('success')(state, action);

        // Additionally store the deliverable at a predictable location so consumers unaware of
        // the request ID can refresh their data if the deliverable is updated
        const { deliverableId, projectId } = action.meta.arg;
        if (action.payload) {
          state[makeDeliverableProjectIdKey(deliverableId, projectId)] = {
            status: 'success',
            data: action.payload,
          };
        }
      })
      .addCase(requestGetDeliverable.rejected, setStatus('error'));
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
