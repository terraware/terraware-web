import { RootState } from 'src/redux/rootReducer';

export const selectSupportRequestTypesByRequest = (requestId: string) => (state: RootState) =>
  state.supportRequestTypes[requestId];
export const selectSupportRequestSubmitRequest = (requestId: string) => (state: RootState) =>
  state.supportRequestSubmit[requestId];
