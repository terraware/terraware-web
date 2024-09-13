import { RootState } from 'src/redux/rootReducer';

export const selectAcceleratorOrgsRequest = (requestId: string) => (state: RootState) =>
  state.acceleratorOrgs[requestId];

export const selectAssignTerraformationContact = (requestId: string) => (state: RootState) =>
  state.assignTerraformationContact[requestId];
