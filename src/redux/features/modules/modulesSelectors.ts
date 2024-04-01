import { RootState } from 'src/redux/rootReducer';

export const selectModule = (moduleId: number) => (state: RootState) => state.module[moduleId];

export const selectModuleList = (projectId: number) => (state: RootState) => state.moduleList[projectId];
