import { RootState } from 'src/redux/rootReducer';

export const selectScore = (projectId: number) => (state: RootState) => state.score[projectId];
export const selectScoreByRequest = (requestId: string) => (state: RootState) => state.score[requestId];
export const selectScoreUpdateRequest = (requestId: string) => (state: RootState) => state.scoreUpdate[requestId];
