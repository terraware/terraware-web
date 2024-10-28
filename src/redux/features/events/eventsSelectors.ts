import { RootState } from 'src/redux/rootReducer';

export const selectEventRequest = (requestId: string) => (state: RootState) => state.event[requestId];

export const selectEventList = (requestId: string) => (state: RootState) => state.eventList[requestId];

export const selectCreateModuleEvent = (requestId: string) => (state: RootState) => state.eventCreate[requestId];

export const selectUpdateEventProjects = (requestId: string) => (state: RootState) =>
  state.eventProjectsUpdate[requestId];

export const selectDeleteEvent = (requestId: string) => (state: RootState) => state.eventDelete[requestId];

export const selectUpdateEvent = (requestId: string) => (state: RootState) => state.eventUpdate[requestId];

export const selectDeleteManyEvents = (requestId: string) => (state: RootState) => state.eventDeleteMany[requestId];
