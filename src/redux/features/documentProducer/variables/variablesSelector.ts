import { RootState } from 'src/redux/rootReducer';

export const selectUpdateVariableWorkflowDetails = (requestId: string) => (state: RootState) =>
  state.variableWorkflowDetailsUpdate[requestId];

export const selectUpdateVariableOwner = (requestId: string) => (state: RootState) =>
  state.variableOwnerUpdate[requestId];
