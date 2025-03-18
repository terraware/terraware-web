import { RootState } from 'src/redux/rootReducer';

export const selectFundingEntitiesRequest = (requestId: string) => (state: RootState) =>
  state.fundingEntities[requestId];

export const selectFundingEntityRequest = (fundingEntityId?: number) => (state: RootState) =>
  state.fundingEntity[fundingEntityId || -1];

export const selectUserFundingEntityRequest = (userId?: number) => (state: RootState) =>
  state.userFundingEntity[userId || -1];

export const selectFundingEntityUpdateRequest = (requestId: string) => (state: RootState) =>
  state.fundingEntityUpdate[requestId];
