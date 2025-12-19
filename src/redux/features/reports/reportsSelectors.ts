import { RootState } from 'src/redux/rootReducer';

export const selectAcceleratorReport = (requestId: string) => (state: RootState) =>
  state.getAcceleratorReport[requestId];

export const selectCreateProjectMetric = (requestId: string) => (state: RootState) =>
  state.projectMetricCreate[requestId];

export const selectCreateStandardMetric = (requestId: string) => (state: RootState) =>
  state.standardMetricCreate[requestId];

export const selectCreateReportConfig = (requestId: string) => (state: RootState) =>
  state.projectReportConfigCreate[requestId];

export const selectListAcceleratorReports = (requestId: string) => (state: RootState) =>
  state.listAcceleratorReports[requestId];

export const selectListReportMetrics = (requestId: string) => (state: RootState) => state.listProjectMetrics[requestId];

export const selectListStandardMetrics = (requestId: string) => (state: RootState) =>
  state.listStandardMetrics[requestId];

export const selectListSystemMetrics = (requestId: string) => (state: RootState) => state.listSystemMetrics[requestId];

export const selectProjectReportConfig = (state: RootState) => state.projectReportConfig;

export const selectPublishAcceleratorReport = (requestId: string) => (state: RootState) =>
  state.publishAcceleratorReport[requestId];

export const selectRefreshAcceleratorReportSystemMetrics = (requestId: string) => (state: RootState) =>
  state.refreshAcceleratorReportSystemMetrics[requestId];

export const selectReviewAcceleratorReport = (requestId: string) => (state: RootState) =>
  state.reviewAcceleratorReport[requestId];

export const selectReviewAcceleratorReportMetric = (requestId: string) => (state: RootState) =>
  state.reviewAcceleratorReportMetric[requestId];

export const selectSubmitAcceleratorReport = (requestId: string) => (state: RootState) =>
  state.submitAcceleratorReport[requestId];

export const selectUpdateAcceleratorReport = (requestId: string) => (state: RootState) =>
  state.updateAcceleratorReport[requestId];

export const selectUpdateAcceleratorReportTargets = (requestId: string) => (state: RootState) =>
  state.updateAcceleratorReportTargets[requestId];

export const selectUpdateProjectMetric = (requestId: string) => (state: RootState) =>
  state.projectMetricUpdate[requestId];

export const selectUpdateStandardMetric = (requestId: string) => (state: RootState) =>
  state.standardMetricUpdate[requestId];

export const selectUpdateReportConfig = (requestId: string) => (state: RootState) =>
  state.projectReportConfigUpdate[requestId];

export const selectDeleteManyAcceleratorReportPhotos = (requestId: string) => (state: RootState) =>
  state.deleteManyAcceleratorReportPhotos[requestId];

export const selectUpdateManyAcceleratorReportPhotos = (requestId: string) => (state: RootState) =>
  state.updateManyAcceleratorReportPhotos[requestId];

export const selectUploadManyAcceleratorReportPhotos = (requestId: string) => (state: RootState) =>
  state.uploadManyAcceleratorReportPhotos[requestId];
