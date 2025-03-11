import { RootState } from 'src/redux/rootReducer';

export const selectProjectReportConfig = (state: RootState) => state.projectReportConfig;

export const selectCreateReportConfig = (requestId: string) => (state: RootState) =>
  state.projectReportConfigCreate[requestId];

export const selectListReportMetrics = (requestId: string) => (state: RootState) => state.listProjectMetrics[requestId];
