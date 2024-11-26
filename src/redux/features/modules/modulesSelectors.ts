import { RootState } from 'src/redux/rootReducer';

export const selectModuleRequest = (requestId: string) => (state: RootState) => state.module[requestId];

export const selectModuleList = (requestId: string) => (state: RootState) => state.moduleList[requestId];

export const selectModuleProjects = (requestId: string) => (state: RootState) => state.moduleProjects[requestId];

export const selectModuleCohorts = (moduleId: string) => (state: RootState) => state.moduleCohorts[moduleId];

export const selectSearchModules = (requestId: string) => (state: RootState) => state.searchModules[requestId];
