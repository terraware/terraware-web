import { RootState } from 'src/redux/rootReducer';

export const selectGisRequest = (requestId: string) => (state: RootState) => state.gisRequest[requestId];
