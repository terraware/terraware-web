import { RootState } from 'src/redux/rootReducer';

export const selectFundingEntitiesRequest = (requestId: string) => (state: RootState) =>
  state.fundingEntities[requestId];

export const selectFundingEntityRequest = (userId?: number) => (state: RootState) => state.fundingEntity[userId || -1];
