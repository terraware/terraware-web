import { ActionReducerMapBuilder, createSlice } from '@reduxjs/toolkit';
import { buildReducers, StatusT } from 'src/redux/features/asyncUtils';
import { BatchData, BatchId } from 'src/services/NurseryBatchService';
import { requestSaveBatch } from 'src/redux/features/batches/batchesAsyncThunks';

type BatchesResponseUnion = (Response & BatchData) | (Response & BatchId);
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
