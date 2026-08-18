import { RootState } from 'src/redux/rootReducer';

export const selectProjectFundingEntities = (requestId: string) => (state: RootState) =>
  state.projectFundingEntities[requestId];
