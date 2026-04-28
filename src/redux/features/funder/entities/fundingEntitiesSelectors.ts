import { RootState } from 'src/redux/rootReducer';

export const selectFundingEntityUpdateRequest = (requestId: string) => (state: RootState) =>
  state.fundingEntityUpdate[requestId];

export const selectFundingEntityCreateRequest = (requestId: string) => (state: RootState) =>
  state.fundingEntityCreate[requestId];

export const selectProjectFundingEntities = (requestId: string) => (state: RootState) =>
  state.projectFundingEntities[requestId];
