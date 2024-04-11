import { RootState } from 'src/redux/rootReducer';

export const selectModule = (moduleId: number) => (state: RootState) => state.module[moduleId]?.data;

export const selectModuleEvent = (eventId: number) => (state: RootState) => state.moduleEvent[eventId]?.data;

export const selectModuleList = (projectId: number) => (state: RootState) => state.moduleList[projectId]?.data;
