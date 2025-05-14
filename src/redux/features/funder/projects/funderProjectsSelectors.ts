import { RootState } from 'src/redux/rootReducer';

export const selectFunderProjectRequest = (projectId: number) => (state: RootState) => state.funderProject[projectId];
