import { RootState } from 'src/redux/rootReducer';

export const selectModuleRequest = (requestId: string) => (state: RootState) => state.module[requestId];

export const selectModuleList = (requestId: string) => (state: RootState) => state.moduleList[requestId];

export const selectModuleOrgProjects = (requestId: string) => (state: RootState) => state.moduleOrgProjects[requestId];

export const selectModuleProjects = (moduleId: string) => (state: RootState) => state.moduleProjects[moduleId];

export const selectSearchModules = (requestId: string) => (state: RootState) => state.searchModules[requestId];
