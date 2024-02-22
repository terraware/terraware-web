import { RootState } from 'src/redux/rootReducer';

export const selectDeliverablesSearchRequest = (requestId: string) => (state: RootState) =>
  state.deliverablesSearch[requestId];

export const selectDeliverable = (deliverableId: number) => (state: RootState) => state.deliverables[deliverableId];

export const selectDeliverableFetchRequest = (requestId: string) => (state: RootState) => state.deliverables[requestId];
