import { RootState } from 'src/redux/rootReducer';

export const selectMergeOtherSpecies = (requestId: string) => (state: RootState) => state.mergeOtherSpecies[requestId];
