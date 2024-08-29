import { RootState } from 'src/redux/rootReducer';

export const selectEventRequest = (requestId: string) => (state: RootState) => state.event[requestId];

export const selectEventList = (requestId: string) => (state: RootState) => state.eventList[requestId];
