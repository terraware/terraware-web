import { RootState } from 'src/redux/rootReducer';

export const selectSyncActivityMedia = (requestId: string) => (state: RootState) => state.syncActivityMedia[requestId];
