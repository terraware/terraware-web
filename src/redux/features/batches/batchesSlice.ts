import { ActionReducerMapBuilder, createSlice } from '@reduxjs/toolkit';
import { buildReducers, StatusT } from 'src/redux/features/asyncUtils';
import { BatchData, BatchId } from 'src/services/NurseryBatchService';
import { requestSaveBatch } from 'src/redux/features/batches/batchesAsyncThunks';

// Since the save batch request might not have a species ID, since one of the requests only returns a batch ID,
// we are going to ensure the species ID is sent back
type SaveBatchResponse = ((Response & BatchData) | (Response & BatchId)) & { speciesId: number };

// New responses will be added to this union
type BatchesResponseUnion = SaveBatchResponse;
type ProjectsRequestsState = Record<string, StatusT<BatchesResponseUnion>>;

const initialBatchesRequestsState: ProjectsRequestsState = {};

export const batchesRequestsSlice = createSlice({
  name: 'batchesRequestsSlice',
  initialState: initialBatchesRequestsState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<ProjectsRequestsState>) => {
    buildReducers(requestSaveBatch)(builder);
  },
});

export const batchesRequestsReducer = batchesRequestsSlice.reducer;
