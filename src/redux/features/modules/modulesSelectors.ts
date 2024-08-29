import { RootState } from 'src/redux/rootReducer';

export const selectModuleRequest = (requestId: string) => (state: RootState) => state.module[requestId];

export const selectModuleDeliverables = (requestId: string) => (state: RootState) =>
  state.moduleDeliverables[requestId];

export const selectModuleList = (requestId: string) => (state: RootState) => state.moduleList[requestId];

export const selectModuleProjects = (requestId: string) => (state: RootState) => state.moduleProjects[requestId];
