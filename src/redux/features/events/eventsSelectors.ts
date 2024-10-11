import { RootState } from 'src/redux/rootReducer';

export const selectEventRequest = (requestId: string) => (state: RootState) => state.event[requestId];

export const selectEventList = (requestId: string) => (state: RootState) => state.eventList[requestId];

export const selectCreateModuleEvent = (requestId: string) => (state: RootState) => state.eventCreate[requestId];

export const selectUpdateEventProjects = (requestId: string) => (state: RootState) =>
  state.eventProjectsUpdate[requestId];
