import { RootState } from 'src/redux/rootReducer';

export const selectCohortModuleRequest = (requestId: string) => (state: RootState) => state.cohortModule[requestId];

export const selectCohortModuleList = (requestId: string) => (state: RootState) => state.cohortModuleList[requestId];

export const selectDeleteCohortModule = (requestId: string) => (state: RootState) =>
  state.cohortModuleDelete[requestId];

export const selectUpdateCohortModule = (requestId: string) => (state: RootState) =>
  state.cohortModuleUpdate[requestId];

export const selectDeleteManyCohortModules = (requestId: string) => (state: RootState) =>
  state.cohortModuleDeleteMany[requestId];

export const selectUpdateManyCohortModules = (requestId: string) => (state: RootState) =>
  state.cohortModuleUpdateMany[requestId];
