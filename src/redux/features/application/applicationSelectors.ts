import { RootState } from 'src/redux/rootReducer';

export const selectApplicationCreate = (requestId: string) => (state: RootState) => state.applicationCreate[requestId];

export const selectApplicationCreateProject = (requestId: string) => (state: RootState) =>
  state.applicationCreateProject[requestId];

export const selectApplicationList = (requestId: string) => (state: RootState) => state.applications[requestId];

export const selectApplicationDeliverableList = (requestId: string) => (state: RootState) =>
  state.applicationDeliverables[requestId];

export const selectApplicationHistoryList = (requestId: string) => (state: RootState) =>
  state.applicationHistory[requestId];

export const selectApplicationModuleList = (requestId: string) => (state: RootState) =>
  state.applicationModules[requestId];

export const selectApplicationRestart = (requestId: string) => (state: RootState) =>
  state.applicationRestart[requestId];

export const selectApplicationReview = (requestId: string) => (state: RootState) => state.applicationReview[requestId];

export const selectApplicationSubmit = (requestId: string) => (state: RootState) => state.applicationSubmit[requestId];

export const selectApplicationUpdateBoundary = (requestId: string) => (state: RootState) =>
  state.applicationUpdateBoundary[requestId];

export const selectApplicationUploadBoundary = (requestId: string) => (state: RootState) =>
  state.applicationUploadBoundary[requestId];
