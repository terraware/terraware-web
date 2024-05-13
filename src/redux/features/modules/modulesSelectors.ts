import { RootState } from 'src/redux/rootReducer';

export const selectModuleRequest = (requestId: string) => (state: RootState) => state.module[requestId];

export const selectProjectModuleList = (requestId: string) => (state: RootState) => state.moduleList[requestId];

export const selectModuleProjects = (requestId: string) => (state: RootState) => state.moduleProjects[requestId];
