import { RootState } from 'src/redux/rootReducer';

export const selectApplicationList = (requestId: string) => (state: RootState) => state.applications[requestId];

export const selectApplicationDeliverableList = (requestId: string) => (state: RootState) =>
  state.applicationDeliverables[requestId];

export const selectApplicationModuleList = (requestId: string) => (state: RootState) =>
  state.applicationModules[requestId];
