import { RootState } from 'src/redux/rootReducer';

export const selectProjectToDoDeliverables = (requestId: string) => (state: RootState) =>
  state.projectToDoDeliverables[requestId];

export const selectProjectToDoEvents = (requestId: string) => (state: RootState) => state.projectToDoEvents[requestId];
