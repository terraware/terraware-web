import { RootState } from 'src/redux/rootReducer';

export const selectScoreList = (projectId: number) => (state: RootState) => state.scoreList[projectId];

export const selectScoreListRequest = (requestId: string) => (state: RootState) => state.scoreList[requestId];

export const selectScoresUpdateRequest = (requestId: string) => (state: RootState) => state.scoresUpdate[requestId];
