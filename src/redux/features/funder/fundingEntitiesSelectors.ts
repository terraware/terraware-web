import { RootState } from 'src/redux/rootReducer';

export const selectFundingEntityRequest = (userId?: number) => (state: RootState) =>
  state.fundingEntities[userId || -1];
