import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers, setStatus } from 'src/redux/features/asyncUtils';
import { requestFetchBatch, requestSaveBatch } from 'src/redux/features/batches/batchesAsyncThunks';
import { BatchData } from 'src/services/NurseryBatchService';
import { Batch } from 'src/types/Batch';

// Since the save batch request might not have a species ID, since one of the requests only returns a batch ID,
// we are going to ensure the species ID is sent back
type SaveBatchResponse = Response & BatchData;

// New responses will be added to this union
type BatchesResponseUnion = SaveBatchResponse;
type BatchesRequestsState = Record<string, StatusT<BatchesResponseUnion>>;
const initialBatchesRequestsState: BatchesRequestsState = {};

export const batchesRequestsSlice = createSlice({
  name: 'batchesRequestsSlice',
  initialState: initialBatchesRequestsState,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestSaveBatch)(builder);
  },
});

type BatchesState = { [key: number | string]: Batch };
const initialBatchesState: BatchesState = {};

export const batchesSlice = createSlice({
  name: 'batchesSlice',
  initialState: initialBatchesState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(requestFetchBatch.pending, setStatus('pending'))
      .addCase(requestFetchBatch.fulfilled, (state, action) => {
        // Manually writing out the reducer for fetch batch because in this instance, we additionally want consumers
        // to be able to additionally get the batch from state by ID, as opposed to only request ID. This allows for
        // the batch state in redux to be shared across multiple consumers
        setStatus('success')(state, action);

        const batchId = action.meta.arg.batchId;
        if (action.payload) {
          state[batchId] = action.payload;
        }
      })
      .addCase(requestFetchBatch.rejected, setStatus('error'));
  },
});

export const batchesRequestsReducer = batchesRequestsSlice.reducer;
export const batchesReducer = batchesSlice.reducer;
