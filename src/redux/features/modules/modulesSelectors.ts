import { RootState } from 'src/redux/rootReducer';

export const selectModuleRequest = (requestId: string) => (state: RootState) => state.module[requestId];

export const selectModuleDeliverables = (requestId: string) => (state: RootState) =>
  state.moduleDeliverables[requestId];

export const selectModuleList = (requestId: string) => (state: RootState) => state.moduleList[requestId];

export const selectModuleProjects = (requestId: string) => (state: RootState) => state.moduleProjects[requestId];

export const selectDeleteCohortModule = (requestId: string) => (state: RootState) =>
  state.cohortModuleDelete[requestId];

export const selectUpdateCohortModule = (requestId: string) => (state: RootState) =>
  state.cohortModuleUpdate[requestId];

export const selectDeleteManyCohortModule = (requestId: string) => (state: RootState) =>
  state.cohortModuleDeleteMany[requestId];

export const selectUpdateManyCohortModule = (requestId: string) => (state: RootState) =>
  state.cohortModuleUpdateMany[requestId];
