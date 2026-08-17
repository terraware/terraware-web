import { RootState } from 'src/redux/rootReducer';

export const selectAcceleratorOrgsRequest = (requestId: string) => (state: RootState) =>
  state.acceleratorOrgs[requestId];
