import { RootState } from 'src/redux/rootReducer';

export const selectUpdateVariableValues = (requestId: string) => (state: RootState) =>
  state.documentProducerVariableValuesUpdate[requestId];

export const selectUploadImageValue = (requestId: string) => (state: RootState) =>
  state.documentProducerVariableValuesImageUpload[requestId];
