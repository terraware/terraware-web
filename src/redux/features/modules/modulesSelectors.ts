import { RootState } from 'src/redux/rootReducer';

export const selectModuleRequest = (requestId: string) => (state: RootState) => state.module[requestId];

export const selectProjectModuleList = (requestId: string) => (state: RootState) => state.moduleList[requestId];

export const selectAllProjectModuleList = (requestId: string) => (state: RootState) => state.allModuleList[requestId];
