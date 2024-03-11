import { RootState } from 'src/redux/rootReducer';

export const selectDeliverablesSearchRequest = (requestId: string) => (state: RootState) =>
  state.deliverablesSearch[requestId];

export const selectDeliverableFetchRequest = (requestId: string) => (state: RootState) => state.deliverables[requestId];

export const selectDeliverablesEditRequest = (requestId: string) => (state: RootState) =>
  state.deliverablesEdit[requestId];
