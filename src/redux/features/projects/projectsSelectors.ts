import { RootState } from 'src/redux/rootReducer';

export const selectProjectRequest = (state: RootState, requestId: string) => state.projectsRequests[requestId];
