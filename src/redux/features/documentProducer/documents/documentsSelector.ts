import { RootState } from 'src/redux/rootReducer';

export const selectDocumentRequest = (requestId: string) => (state: RootState) =>
  state.documentProducerDocumentRequests[requestId];
