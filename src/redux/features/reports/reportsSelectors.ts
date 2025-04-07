import { RootState } from 'src/redux/rootReducer';

export const selectProjectReportConfig = (state: RootState) => state.projectReportConfig;

export const selectCreateReportConfig = (requestId: string) => (state: RootState) =>
  state.projectReportConfigCreate[requestId];

export const selectUpdateReportConfig = (requestId: string) => (state: RootState) =>
  state.projectReportConfigUpdate[requestId];

export const selectListReportMetrics = (requestId: string) => (state: RootState) => state.listProjectMetrics[requestId];

export const selectListStandardMetrics = (requestId: string) => (state: RootState) =>
  state.listStandardMetrics[requestId];

export const selectListSystemMetrics = (requestId: string) => (state: RootState) => state.listSystemMetrics[requestId];

export const selectCreateProjectMetric = (requestId: string) => (state: RootState) =>
  state.projectMetricCreate[requestId];

export const selectListAcceleratorReports = (requestId: string) => (state: RootState) =>
  state.listAcceleratorReports[requestId];

export const selectUpdateProjectMetric = (requestId: string) => (state: RootState) =>
  state.projectMetricUpdate[requestId];

export const selectReviewManyAcceleratorReportMetrics = (requestId: string) => (state: RootState) =>
  state.reviewManyAcceleratorReportMetrics[requestId];

export const selectReviewAcceleratorReportMetric = (requestId: string) => (state: RootState) =>
  state.reviewAcceleratorReportMetric[requestId];

export const selectReviewAcceleratorReport = (requestId: string) => (state: RootState) =>
  state.reviewAcceleratorReport[requestId];

export const selectRefreshAcceleratorReportSystemMetrics = (requestId: string) => (state: RootState) =>
  state.refreshAcceleratorReportSystemMetrics[requestId];

export const selectUpdateAcceleratorReport = (requestId: string) => (state: RootState) =>
  state.updateAcceleratorReport[requestId];

export const getAcceleratorReport = (requestId: string) => (state: RootState) => state.getAcceleratorReport[requestId];
