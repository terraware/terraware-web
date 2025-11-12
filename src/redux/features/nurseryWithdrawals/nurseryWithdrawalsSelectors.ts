import { RootState } from 'src/redux/rootReducer';

export const selectNurseryWithdrawalsList = (requestId: string) => (state: RootState) =>
  state.nurseryWithdrawalsList[requestId];

export const selectNurseryWithdrawalsFilterOptions = (requestId: string) => (state: RootState) =>
  state.nurseryWithdrawalsFilterOptions[requestId];

export const selectNurseryWithdrawalsCount = (requestId: string) => (state: RootState) =>
  state.nurseryWithdrawalsCount[requestId];
