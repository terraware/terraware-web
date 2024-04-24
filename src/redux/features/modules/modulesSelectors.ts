import createCachedSelector from 're-reselect';

import { RootState } from 'src/redux/rootReducer';

export const selectModuleRequest = (requestId: string) => (state: RootState) => state.module[requestId];

export const selectProjectModuleList = (projectId: number) => (state: RootState) => state.moduleList[projectId]?.data;

export const selectAllModuleList = createCachedSelector(
  (state: RootState, projectIds: number[]) =>
    projectIds.map((projectId) => ({ id: projectId, modules: state.moduleList[projectId]?.data })),
  (data) => data
)(() => 'allModules');
