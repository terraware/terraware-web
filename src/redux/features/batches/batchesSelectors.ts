import { RootState } from 'src/redux/rootReducer';

export const selectBatchesRequest = (requestId: string) => (state: RootState) => state.batchesRequests[requestId];
