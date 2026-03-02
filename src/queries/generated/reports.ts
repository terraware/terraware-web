import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listAcceleratorReports: build.query<ListAcceleratorReportsApiResponse, ListAcceleratorReportsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports`,
        params: {
          year: queryArg.year,
          includeArchived: queryArg.includeArchived,
          includeFuture: queryArg.includeFuture,
          includeMetrics: queryArg.includeMetrics,
          includeIndicators: queryArg.includeIndicators,
        },
      }),
    }),
    updateAutoCalculatedIndicatorTarget: build.mutation<
      UpdateAutoCalculatedIndicatorTargetApiResponse,
      UpdateAutoCalculatedIndicatorTargetApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/autoCalculatedIndicatorTarget`,
        method: 'POST',
        body: queryArg.updateAutoCalculatedIndicatorTargetRequestPayload,
      }),
    }),
    updateAutoCalculatedIndicatorBaselineTarget: build.mutation<
      UpdateAutoCalculatedIndicatorBaselineTargetApiResponse,
      UpdateAutoCalculatedIndicatorBaselineTargetApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/autoCalculatedIndicatorTarget/baseline`,
        method: 'POST',
        body: queryArg.updateAutoCalculatedIndicatorBaselineTargetRequestPayload,
      }),
    }),
    getAutoCalculatedIndicatorTargets: build.query<
      GetAutoCalculatedIndicatorTargetsApiResponse,
      GetAutoCalculatedIndicatorTargetsApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/accelerator/projects/${queryArg}/reports/autoCalculatedIndicatorTargets` }),
    }),
    updateCommonIndicatorTarget: build.mutation<
      UpdateCommonIndicatorTargetApiResponse,
      UpdateCommonIndicatorTargetApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/commonIndicatorTarget`,
        method: 'POST',
        body: queryArg.updateCommonIndicatorTargetRequestPayload,
      }),
    }),
    updateCommonIndicatorBaselineTarget: build.mutation<
      UpdateCommonIndicatorBaselineTargetApiResponse,
      UpdateCommonIndicatorBaselineTargetApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/commonIndicatorTarget/baseline`,
        method: 'POST',
        body: queryArg.updateCommonIndicatorBaselineTargetRequestPayload,
      }),
    }),
    getCommonIndicatorTargets: build.query<GetCommonIndicatorTargetsApiResponse, GetCommonIndicatorTargetsApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/projects/${queryArg}/reports/commonIndicatorTargets` }),
    }),
    listAcceleratorReportConfig: build.query<ListAcceleratorReportConfigApiResponse, ListAcceleratorReportConfigApiArg>(
      {
        query: (queryArg) => ({ url: `/api/v1/accelerator/projects/${queryArg}/reports/configs` }),
      }
    ),
    updateProjectAcceleratorReportConfig: build.mutation<
      UpdateProjectAcceleratorReportConfigApiResponse,
      UpdateProjectAcceleratorReportConfigApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/configs`,
        method: 'POST',
        body: queryArg.updateProjectAcceleratorReportConfigRequestPayload,
      }),
    }),
    createAcceleratorReportConfig: build.mutation<
      CreateAcceleratorReportConfigApiResponse,
      CreateAcceleratorReportConfigApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/configs`,
        method: 'PUT',
        body: queryArg.createAcceleratorReportConfigRequestPayload,
      }),
    }),
    updateAcceleratorReportConfig: build.mutation<
      UpdateAcceleratorReportConfigApiResponse,
      UpdateAcceleratorReportConfigApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/configs/${queryArg.configId}`,
        method: 'POST',
        body: queryArg.updateAcceleratorReportConfigRequestPayload,
      }),
    }),
    listProjectIndicators: build.query<ListProjectIndicatorsApiResponse, ListProjectIndicatorsApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/projects/${queryArg}/reports/indicators` }),
    }),
    createProjectIndicator: build.mutation<CreateProjectIndicatorApiResponse, CreateProjectIndicatorApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/indicators`,
        method: 'PUT',
        body: queryArg.createProjectIndicatorRequestPayload,
      }),
    }),
    updateProjectIndicator: build.mutation<UpdateProjectIndicatorApiResponse, UpdateProjectIndicatorApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/indicators/${queryArg.indicatorId}`,
        method: 'POST',
        body: queryArg.updateProjectIndicatorRequestPayload,
      }),
    }),
    listProjectMetrics: build.query<ListProjectMetricsApiResponse, ListProjectMetricsApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/projects/${queryArg}/reports/metrics` }),
    }),
    createProjectMetric: build.mutation<CreateProjectMetricApiResponse, CreateProjectMetricApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/metrics`,
        method: 'PUT',
        body: queryArg.createProjectMetricRequestPayload,
      }),
    }),
    updateProjectMetric: build.mutation<UpdateProjectMetricApiResponse, UpdateProjectMetricApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/metrics/${queryArg.metricId}`,
        method: 'POST',
        body: queryArg.updateProjectMetricRequestPayload,
      }),
    }),
    updateProjectIndicatorTarget: build.mutation<
      UpdateProjectIndicatorTargetApiResponse,
      UpdateProjectIndicatorTargetApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/projectIndicatorTarget`,
        method: 'POST',
        body: queryArg.updateProjectIndicatorTargetRequestPayload,
      }),
    }),
    updateProjectIndicatorBaselineTarget: build.mutation<
      UpdateProjectIndicatorBaselineTargetApiResponse,
      UpdateProjectIndicatorBaselineTargetApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/projectIndicatorTarget/baseline`,
        method: 'POST',
        body: queryArg.updateProjectIndicatorBaselineTargetRequestPayload,
      }),
    }),
    getProjectIndicatorTargets: build.query<GetProjectIndicatorTargetsApiResponse, GetProjectIndicatorTargetsApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/projects/${queryArg}/reports/projectIndicatorTargets` }),
    }),
    updateProjectMetricTarget: build.mutation<UpdateProjectMetricTargetApiResponse, UpdateProjectMetricTargetApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/projectMetricTarget`,
        method: 'POST',
        body: queryArg.updateProjectMetricTargetRequestPayload,
      }),
    }),
    getProjectMetricTargets: build.query<GetProjectMetricTargetsApiResponse, GetProjectMetricTargetsApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/projects/${queryArg}/reports/projectMetricTargets` }),
    }),
    updateStandardMetricTarget: build.mutation<UpdateStandardMetricTargetApiResponse, UpdateStandardMetricTargetApiArg>(
      {
        query: (queryArg) => ({
          url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/standardMetricTarget`,
          method: 'POST',
          body: queryArg.updateStandardMetricTargetRequestPayload,
        }),
      }
    ),
    getStandardMetricTargets: build.query<GetStandardMetricTargetsApiResponse, GetStandardMetricTargetsApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/projects/${queryArg}/reports/standardMetricTargets` }),
    }),
    updateSystemMetricTarget: build.mutation<UpdateSystemMetricTargetApiResponse, UpdateSystemMetricTargetApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/systemMetricTarget`,
        method: 'POST',
        body: queryArg.updateSystemMetricTargetRequestPayload,
      }),
    }),
    getSystemMetricTargets: build.query<GetSystemMetricTargetsApiResponse, GetSystemMetricTargetsApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/projects/${queryArg}/reports/systemMetricTargets` }),
    }),
    getAcceleratorReportYears: build.query<GetAcceleratorReportYearsApiResponse, GetAcceleratorReportYearsApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/projects/${queryArg}/reports/years` }),
    }),
    getAcceleratorReport: build.query<GetAcceleratorReportApiResponse, GetAcceleratorReportApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/${queryArg.reportId}`,
        params: {
          includeMetrics: queryArg.includeMetrics,
          includeIndicators: queryArg.includeIndicators,
        },
      }),
    }),
    updateAcceleratorReportValues: build.mutation<
      UpdateAcceleratorReportValuesApiResponse,
      UpdateAcceleratorReportValuesApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/${queryArg.reportId}`,
        method: 'POST',
        body: queryArg.updateAcceleratorReportValuesRequestPayload,
      }),
    }),
    refreshAcceleratorReportAutoCalculatedIndicators: build.mutation<
      RefreshAcceleratorReportAutoCalculatedIndicatorsApiResponse,
      RefreshAcceleratorReportAutoCalculatedIndicatorsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/${queryArg.reportId}/indicators/refresh`,
        method: 'POST',
        params: {
          indicators: queryArg.indicators,
        },
      }),
    }),
    reviewAcceleratorReportIndicators: build.mutation<
      ReviewAcceleratorReportIndicatorsApiResponse,
      ReviewAcceleratorReportIndicatorsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/${queryArg.reportId}/indicators/review`,
        method: 'POST',
        body: queryArg.reviewAcceleratorReportIndicatorsRequestPayload,
      }),
    }),
    refreshAcceleratorReportSystemMetrics: build.mutation<
      RefreshAcceleratorReportSystemMetricsApiResponse,
      RefreshAcceleratorReportSystemMetricsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/${queryArg.reportId}/metrics/refresh`,
        method: 'POST',
        params: {
          metrics: queryArg.metrics,
        },
      }),
    }),
    reviewAcceleratorReportMetrics: build.mutation<
      ReviewAcceleratorReportMetricsApiResponse,
      ReviewAcceleratorReportMetricsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/${queryArg.reportId}/metrics/review`,
        method: 'POST',
        body: queryArg.reviewAcceleratorReportMetricsRequestPayload,
      }),
    }),
    uploadAcceleratorReportPhoto: build.mutation<
      UploadAcceleratorReportPhotoApiResponse,
      UploadAcceleratorReportPhotoApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/${queryArg.reportId}/photos`,
        method: 'POST',
        body: queryArg.body,
      }),
    }),
    deleteAcceleratorReportPhoto: build.mutation<
      DeleteAcceleratorReportPhotoApiResponse,
      DeleteAcceleratorReportPhotoApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/${queryArg.reportId}/photos/${queryArg.fileId}`,
        method: 'DELETE',
        body: queryArg.body,
      }),
    }),
    getAcceleratorReportPhoto: build.query<GetAcceleratorReportPhotoApiResponse, GetAcceleratorReportPhotoApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/${queryArg.reportId}/photos/${queryArg.fileId}`,
        params: {
          maxWidth: queryArg.maxWidth,
          maxHeight: queryArg.maxHeight,
        },
      }),
    }),
    updateAcceleratorReportPhoto: build.mutation<
      UpdateAcceleratorReportPhotoApiResponse,
      UpdateAcceleratorReportPhotoApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/${queryArg.reportId}/photos/${queryArg.fileId}`,
        method: 'PUT',
        body: queryArg.updateAcceleratorReportPhotoRequestPayload,
      }),
    }),
    publishAcceleratorReport: build.mutation<PublishAcceleratorReportApiResponse, PublishAcceleratorReportApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/${queryArg.reportId}/publish`,
        method: 'POST',
      }),
    }),
    reviewAcceleratorReport: build.mutation<ReviewAcceleratorReportApiResponse, ReviewAcceleratorReportApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/${queryArg.reportId}/review`,
        method: 'POST',
        body: queryArg.reviewAcceleratorReportRequestPayload,
      }),
    }),
    submitAcceleratorReport: build.mutation<SubmitAcceleratorReportApiResponse, SubmitAcceleratorReportApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/${queryArg.reportId}/submit`,
        method: 'POST',
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListAcceleratorReportsApiResponse =
  /** status 200 The requested operation succeeded. */ ListAcceleratorReportsResponsePayload;
export type ListAcceleratorReportsApiArg = {
  projectId: number;
  year?: number;
  includeArchived?: boolean;
  includeFuture?: boolean;
  /** Use includeIndicators instead */
  includeMetrics?: boolean;
  includeIndicators?: boolean;
};
export type UpdateAutoCalculatedIndicatorTargetApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateAutoCalculatedIndicatorTargetApiArg = {
  projectId: number;
  updateAutoCalculatedIndicatorTargetRequestPayload: UpdateAutoCalculatedIndicatorTargetRequestPayload;
};
export type UpdateAutoCalculatedIndicatorBaselineTargetApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateAutoCalculatedIndicatorBaselineTargetApiArg = {
  projectId: number;
  updateAutoCalculatedIndicatorBaselineTargetRequestPayload: UpdateAutoCalculatedIndicatorBaselineTargetRequestPayload;
};
export type GetAutoCalculatedIndicatorTargetsApiResponse =
  /** status 200 The requested operation succeeded. */ GetAutoCalculatedIndicatorTargetsResponsePayload;
export type GetAutoCalculatedIndicatorTargetsApiArg = number;
export type UpdateCommonIndicatorTargetApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateCommonIndicatorTargetApiArg = {
  projectId: number;
  updateCommonIndicatorTargetRequestPayload: UpdateCommonIndicatorTargetRequestPayload;
};
export type UpdateCommonIndicatorBaselineTargetApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateCommonIndicatorBaselineTargetApiArg = {
  projectId: number;
  updateCommonIndicatorBaselineTargetRequestPayload: UpdateCommonIndicatorBaselineTargetRequestPayload;
};
export type GetCommonIndicatorTargetsApiResponse =
  /** status 200 The requested operation succeeded. */ GetCommonIndicatorTargetsResponsePayload;
export type GetCommonIndicatorTargetsApiArg = number;
export type ListAcceleratorReportConfigApiResponse =
  /** status 200 The requested operation succeeded. */ ListAcceleratorReportConfigResponsePayload;
export type ListAcceleratorReportConfigApiArg = number;
export type UpdateProjectAcceleratorReportConfigApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateProjectAcceleratorReportConfigApiArg = {
  projectId: number;
  updateProjectAcceleratorReportConfigRequestPayload: UpdateProjectAcceleratorReportConfigRequestPayload;
};
export type CreateAcceleratorReportConfigApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type CreateAcceleratorReportConfigApiArg = {
  projectId: number;
  createAcceleratorReportConfigRequestPayload: CreateAcceleratorReportConfigRequestPayload;
};
export type UpdateAcceleratorReportConfigApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateAcceleratorReportConfigApiArg = {
  projectId: number;
  configId: number;
  updateAcceleratorReportConfigRequestPayload: UpdateAcceleratorReportConfigRequestPayload;
};
export type ListProjectIndicatorsApiResponse =
  /** status 200 The requested operation succeeded. */ ListProjectIndicatorsResponsePayload;
export type ListProjectIndicatorsApiArg = number;
export type CreateProjectIndicatorApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type CreateProjectIndicatorApiArg = {
  projectId: number;
  createProjectIndicatorRequestPayload: CreateProjectIndicatorRequestPayload;
};
export type UpdateProjectIndicatorApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateProjectIndicatorApiArg = {
  indicatorId: number;
  projectId: number;
  updateProjectIndicatorRequestPayload: UpdateProjectIndicatorRequestPayload;
};
export type ListProjectMetricsApiResponse =
  /** status 200 The requested operation succeeded. */ ListProjectMetricsResponsePayload;
export type ListProjectMetricsApiArg = number;
export type CreateProjectMetricApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type CreateProjectMetricApiArg = {
  projectId: number;
  createProjectMetricRequestPayload: CreateProjectMetricRequestPayload;
};
export type UpdateProjectMetricApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateProjectMetricApiArg = {
  metricId: number;
  projectId: number;
  updateProjectMetricRequestPayload: UpdateProjectMetricRequestPayload;
};
export type UpdateProjectIndicatorTargetApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateProjectIndicatorTargetApiArg = {
  projectId: number;
  updateProjectIndicatorTargetRequestPayload: UpdateProjectIndicatorTargetRequestPayload;
};
export type UpdateProjectIndicatorBaselineTargetApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateProjectIndicatorBaselineTargetApiArg = {
  projectId: number;
  updateProjectIndicatorBaselineTargetRequestPayload: UpdateProjectIndicatorBaselineTargetRequestPayload;
};
export type GetProjectIndicatorTargetsApiResponse =
  /** status 200 The requested operation succeeded. */ GetProjectIndicatorTargetsResponsePayload;
export type GetProjectIndicatorTargetsApiArg = number;
export type UpdateProjectMetricTargetApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateProjectMetricTargetApiArg = {
  projectId: number;
  updateProjectMetricTargetRequestPayload: UpdateProjectMetricTargetRequestPayload;
};
export type GetProjectMetricTargetsApiResponse =
  /** status 200 The requested operation succeeded. */ GetProjectMetricTargetsResponsePayload;
export type GetProjectMetricTargetsApiArg = number;
export type UpdateStandardMetricTargetApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateStandardMetricTargetApiArg = {
  projectId: number;
  updateStandardMetricTargetRequestPayload: UpdateStandardMetricTargetRequestPayload;
};
export type GetStandardMetricTargetsApiResponse =
  /** status 200 The requested operation succeeded. */ GetStandardMetricTargetsResponsePayload;
export type GetStandardMetricTargetsApiArg = number;
export type UpdateSystemMetricTargetApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateSystemMetricTargetApiArg = {
  projectId: number;
  updateSystemMetricTargetRequestPayload: UpdateSystemMetricTargetRequestPayload;
};
export type GetSystemMetricTargetsApiResponse =
  /** status 200 The requested operation succeeded. */ GetSystemMetricTargetsResponsePayload;
export type GetSystemMetricTargetsApiArg = number;
export type GetAcceleratorReportYearsApiResponse =
  /** status 200 The requested operation succeeded. */ GetAcceleratorReportYearsResponsePayload;
export type GetAcceleratorReportYearsApiArg = number;
export type GetAcceleratorReportApiResponse =
  /** status 200 The requested operation succeeded. */ GetAcceleratorReportResponsePayload;
export type GetAcceleratorReportApiArg = {
  projectId: number;
  reportId: number;
  /** Use includeIndicators instead */
  includeMetrics?: boolean;
  includeIndicators?: boolean;
};
export type UpdateAcceleratorReportValuesApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateAcceleratorReportValuesApiArg = {
  projectId: number;
  reportId: number;
  updateAcceleratorReportValuesRequestPayload: UpdateAcceleratorReportValuesRequestPayload;
};
export type RefreshAcceleratorReportAutoCalculatedIndicatorsApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type RefreshAcceleratorReportAutoCalculatedIndicatorsApiArg = {
  projectId: number;
  reportId: number;
  indicators: (
    | 'Seeds Collected'
    | 'Seedlings'
    | 'Trees Planted'
    | 'Species Planted'
    | 'Hectares Planted'
    | 'Survival Rate'
  )[];
};
export type ReviewAcceleratorReportIndicatorsApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type ReviewAcceleratorReportIndicatorsApiArg = {
  projectId: number;
  reportId: number;
  reviewAcceleratorReportIndicatorsRequestPayload: ReviewAcceleratorReportIndicatorsRequestPayload;
};
export type RefreshAcceleratorReportSystemMetricsApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type RefreshAcceleratorReportSystemMetricsApiArg = {
  projectId: number;
  reportId: number;
  metrics: (
    | 'Seeds Collected'
    | 'Seedlings'
    | 'Trees Planted'
    | 'Species Planted'
    | 'Hectares Planted'
    | 'Survival Rate'
  )[];
};
export type ReviewAcceleratorReportMetricsApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type ReviewAcceleratorReportMetricsApiArg = {
  projectId: number;
  reportId: number;
  reviewAcceleratorReportMetricsRequestPayload: ReviewAcceleratorReportMetricsRequestPayload;
};
export type UploadAcceleratorReportPhotoApiResponse = /** status 200 OK */ UploadAcceleratorReportPhotoResponsePayload;
export type UploadAcceleratorReportPhotoApiArg = {
  projectId: number;
  reportId: number;
  body: {
    caption?: string;
    file: Blob;
  };
};
export type DeleteAcceleratorReportPhotoApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type DeleteAcceleratorReportPhotoApiArg = {
  projectId: number;
  reportId: number;
  fileId: number;
  body: Blob;
};
export type GetAcceleratorReportPhotoApiResponse = /** status 200 The photo was successfully retrieved. */ Blob;
export type GetAcceleratorReportPhotoApiArg = {
  projectId: number;
  reportId: number;
  fileId: number;
  /** Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
  maxWidth?: number;
  /** Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
  maxHeight?: number;
};
export type UpdateAcceleratorReportPhotoApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateAcceleratorReportPhotoApiArg = {
  projectId: number;
  reportId: number;
  fileId: number;
  updateAcceleratorReportPhotoRequestPayload: UpdateAcceleratorReportPhotoRequestPayload;
};
export type PublishAcceleratorReportApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type PublishAcceleratorReportApiArg = {
  projectId: number;
  reportId: number;
};
export type ReviewAcceleratorReportApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type ReviewAcceleratorReportApiArg = {
  projectId: number;
  reportId: number;
  reviewAcceleratorReportRequestPayload: ReviewAcceleratorReportRequestPayload;
};
export type SubmitAcceleratorReportApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type SubmitAcceleratorReportApiArg = {
  projectId: number;
  reportId: number;
};
export type ReportAutoCalculatedIndicatorPayload = {
  category: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  description?: string;
  indicator:
    | 'Seeds Collected'
    | 'Seedlings'
    | 'Trees Planted'
    | 'Species Planted'
    | 'Hectares Planted'
    | 'Survival Rate';
  isPublishable: boolean;
  level: 'Activity' | 'Output' | 'Outcome' | 'Impact';
  overrideValue?: number;
  progressNotes?: string;
  projectsComments?: string;
  refId: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely';
  systemTime?: string;
  systemValue?: number;
  target?: number;
};
export type ReportChallengePayload = {
  challenge: string;
  mitigationPlan: string;
};
export type ReportCommonIndicatorPayload = {
  category: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  description?: string;
  id: number;
  isPublishable: boolean;
  level: 'Activity' | 'Output' | 'Outcome' | 'Impact';
  name: string;
  progressNotes?: string;
  projectsComments?: string;
  refId: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely';
  target?: number;
  value?: number;
};
export type SimpleUserPayload = {
  fullName: string;
  userId: number;
};
export type ReportPhotoPayload = {
  caption?: string;
  fileId: number;
};
export type ReportProjectIndicatorPayload = {
  category: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  description?: string;
  id: number;
  isPublishable: boolean;
  level: 'Activity' | 'Output' | 'Outcome' | 'Impact';
  name: string;
  progressNotes?: string;
  projectsComments?: string;
  refId: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely';
  target?: number;
  unit?: string;
  value?: number;
};
export type ReportProjectMetricPayload = {
  component: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  description?: string;
  id: number;
  isPublishable: boolean;
  name: string;
  progressNotes?: string;
  projectsComments?: string;
  reference: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely';
  target?: number;
  type: 'Activity' | 'Output' | 'Outcome' | 'Impact';
  unit?: string;
  value?: number;
};
export type ReportStandardMetricPayload = {
  component: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  description?: string;
  id: number;
  isPublishable: boolean;
  name: string;
  progressNotes?: string;
  projectsComments?: string;
  reference: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely';
  target?: number;
  type: 'Activity' | 'Output' | 'Outcome' | 'Impact';
  value?: number;
};
export type ReportSystemMetricPayload = {
  component: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  description?: string;
  isPublishable: boolean;
  metric: 'Seeds Collected' | 'Seedlings' | 'Trees Planted' | 'Species Planted' | 'Hectares Planted' | 'Survival Rate';
  overrideValue?: number;
  progressNotes?: string;
  projectsComments?: string;
  reference: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely';
  systemTime?: string;
  systemValue?: number;
  target?: number;
  type: 'Activity' | 'Output' | 'Outcome' | 'Impact';
};
export type AcceleratorReportPayload = {
  achievements: string[];
  additionalComments?: string;
  autoCalculatedIndicators: ReportAutoCalculatedIndicatorPayload[];
  challenges: ReportChallengePayload[];
  commonIndicators: ReportCommonIndicatorPayload[];
  endDate: string;
  feedback?: string;
  financialSummaries?: string;
  highlights?: string;
  id: number;
  internalComment?: string;
  modifiedBy: number;
  modifiedByUser: SimpleUserPayload;
  modifiedTime: string;
  photos: ReportPhotoPayload[];
  projectId: number;
  projectIndicators: ReportProjectIndicatorPayload[];
  /** Use projectIndicators instead */
  projectMetrics: ReportProjectMetricPayload[];
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  /** Use commonIndicators instead */
  standardMetrics: ReportStandardMetricPayload[];
  startDate: string;
  status: 'Not Submitted' | 'Submitted' | 'Approved' | 'Needs Update' | 'Not Needed';
  submittedBy?: number;
  submittedByUser?: SimpleUserPayload;
  submittedTime?: string;
  /** Use autoCalculatedIndicators instead */
  systemMetrics: ReportSystemMetricPayload[];
};
export type SuccessOrError = 'ok' | 'error';
export type ListAcceleratorReportsResponsePayload = {
  reports: AcceleratorReportPayload[];
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type UpdateAutoCalculatedIndicatorTargetRequestPayload = {
  indicator:
    | 'Seeds Collected'
    | 'Seedlings'
    | 'Trees Planted'
    | 'Species Planted'
    | 'Hectares Planted'
    | 'Survival Rate';
  target?: number;
  year: number;
};
export type UpdateAutoCalculatedIndicatorBaselineTargetRequestPayload = {
  baseline?: number;
  endOfProjectTarget?: number;
  indicator:
    | 'Seeds Collected'
    | 'Seedlings'
    | 'Trees Planted'
    | 'Species Planted'
    | 'Hectares Planted'
    | 'Survival Rate';
};
export type YearlyIndicatorTargetPayload = {
  target?: number;
  year: number;
};
export type AutoCalculatedIndicatorTargetsPayload = {
  baseline?: number;
  endOfProjectTarget?: number;
  indicatorId:
    | 'Seeds Collected'
    | 'Seedlings'
    | 'Trees Planted'
    | 'Species Planted'
    | 'Hectares Planted'
    | 'Survival Rate';
  yearlyTargets: YearlyIndicatorTargetPayload[];
};
export type GetAutoCalculatedIndicatorTargetsResponsePayload = {
  status: SuccessOrError;
  targets: AutoCalculatedIndicatorTargetsPayload[];
};
export type UpdateCommonIndicatorTargetRequestPayload = {
  indicatorId: number;
  target?: number;
  year: number;
};
export type UpdateCommonIndicatorBaselineTargetRequestPayload = {
  baseline?: number;
  endOfProjectTarget?: number;
  indicatorId: number;
};
export type CommonIndicatorTargetsPayload = {
  baseline?: number;
  endOfProjectTarget?: number;
  indicatorId: number;
  yearlyTargets: YearlyIndicatorTargetPayload[];
};
export type GetCommonIndicatorTargetsResponsePayload = {
  status: SuccessOrError;
  targets: CommonIndicatorTargetsPayload[];
};
export type ExistingAcceleratorReportConfigPayload = {
  configId: number;
  logframeUrl?: string;
  projectId: number;
  reportingEndDate: string;
  reportingStartDate: string;
};
export type ListAcceleratorReportConfigResponsePayload = {
  configs: ExistingAcceleratorReportConfigPayload[];
  status: SuccessOrError;
};
export type UpdateAcceleratorReportConfigPayload = {
  logframeUrl?: string;
  reportingEndDate: string;
  reportingStartDate: string;
};
export type UpdateProjectAcceleratorReportConfigRequestPayload = {
  config: UpdateAcceleratorReportConfigPayload;
};
export type NewAcceleratorReportConfigPayload = {
  logframeUrl?: string;
  reportingEndDate: string;
  reportingStartDate: string;
};
export type CreateAcceleratorReportConfigRequestPayload = {
  config: NewAcceleratorReportConfigPayload;
};
export type UpdateAcceleratorReportConfigRequestPayload = {
  config: UpdateAcceleratorReportConfigPayload;
};
export type ExistingProjectIndicatorPayload = {
  active: boolean;
  category: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  classId?: 'Cumulative' | 'Level';
  description?: string;
  frequency?: 'Annual' | 'Bi-Annual' | 'MRV Cycle';
  id: number;
  isPublishable: boolean;
  level: 'Activity' | 'Output' | 'Outcome' | 'Impact';
  name: string;
  notes?: string;
  primaryDataSource?: string;
  projectId: number;
  refId: string;
  tfOwner?: string;
  unit?: string;
};
export type ListProjectIndicatorsResponsePayload = {
  indicators: ExistingProjectIndicatorPayload[];
  status: SuccessOrError;
};
export type NewIndicatorPayload = {
  category: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  classId?: 'Cumulative' | 'Level';
  description?: string;
  frequency?: 'Annual' | 'Bi-Annual' | 'MRV Cycle';
  isPublishable: boolean;
  level: 'Activity' | 'Output' | 'Outcome' | 'Impact';
  name: string;
  notes?: string;
  primaryDataSource?: string;
  refId: string;
  tfOwner?: string;
  unit?: string;
};
export type CreateProjectIndicatorRequestPayload = {
  indicator: NewIndicatorPayload;
};
export type UpdateProjectIndicatorRequestPayload = {
  indicator: ExistingProjectIndicatorPayload;
};
export type ExistingProjectMetricPayload = {
  component: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  description?: string;
  id: number;
  isPublishable: boolean;
  name: string;
  projectId: number;
  reference: string;
  type: 'Activity' | 'Output' | 'Outcome' | 'Impact';
  unit?: string;
};
export type ListProjectMetricsResponsePayload = {
  metrics: ExistingProjectMetricPayload[];
  status: SuccessOrError;
};
export type NewMetricPayload = {
  component: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  description?: string;
  isPublishable: boolean;
  name: string;
  reference: string;
  type: 'Activity' | 'Output' | 'Outcome' | 'Impact';
  unit?: string;
};
export type CreateProjectMetricRequestPayload = {
  metric: NewMetricPayload;
};
export type UpdateProjectMetricRequestPayload = {
  metric: ExistingProjectMetricPayload;
};
export type UpdateProjectIndicatorTargetRequestPayload = {
  indicatorId: number;
  target?: number;
  year: number;
};
export type UpdateProjectIndicatorBaselineTargetRequestPayload = {
  baseline?: number;
  endOfProjectTarget?: number;
  indicatorId: number;
};
export type ProjectIndicatorTargetsPayload = {
  baseline?: number;
  endOfProjectTarget?: number;
  indicatorId: number;
  yearlyTargets: YearlyIndicatorTargetPayload[];
};
export type GetProjectIndicatorTargetsResponsePayload = {
  status: SuccessOrError;
  targets: ProjectIndicatorTargetsPayload[];
};
export type UpdateProjectMetricTargetRequestPayload = {
  metricId: number;
  target?: number;
  year: number;
};
export type ReportProjectMetricTargetPayload = {
  metricId: number;
  target?: number;
  year: number;
};
export type GetProjectMetricTargetsResponsePayload = {
  status: SuccessOrError;
  targets: ReportProjectMetricTargetPayload[];
};
export type UpdateStandardMetricTargetRequestPayload = {
  metricId: number;
  target?: number;
  year: number;
};
export type ReportStandardMetricTargetPayload = {
  metricId: number;
  target?: number;
  year: number;
};
export type GetStandardMetricTargetsResponsePayload = {
  status: SuccessOrError;
  targets: ReportStandardMetricTargetPayload[];
};
export type UpdateSystemMetricTargetRequestPayload = {
  metric: 'Seeds Collected' | 'Seedlings' | 'Trees Planted' | 'Species Planted' | 'Hectares Planted' | 'Survival Rate';
  target?: number;
  year: number;
};
export type ReportSystemMetricTargetPayload = {
  metric: 'Seeds Collected' | 'Seedlings' | 'Trees Planted' | 'Species Planted' | 'Hectares Planted' | 'Survival Rate';
  target?: number;
  year: number;
};
export type GetSystemMetricTargetsResponsePayload = {
  status: SuccessOrError;
  targets: ReportSystemMetricTargetPayload[];
};
export type ReportYearsPayload = {
  endYear: number;
  startYear: number;
};
export type GetAcceleratorReportYearsResponsePayload = {
  status: SuccessOrError;
  years?: ReportYearsPayload;
};
export type GetAcceleratorReportResponsePayload = {
  report: AcceleratorReportPayload;
  status: SuccessOrError;
};
export type ReportAutoCalculatedIndicatorEntriesPayload = {
  indicator:
    | 'Seeds Collected'
    | 'Seedlings'
    | 'Trees Planted'
    | 'Species Planted'
    | 'Hectares Planted'
    | 'Survival Rate';
  overrideValue?: number;
  progressNotes?: string;
  projectsComments?: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely';
};
export type ReportCommonIndicatorEntriesPayload = {
  id: number;
  progressNotes?: string;
  projectsComments?: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely';
  value?: number;
};
export type ReportProjectIndicatorEntriesPayload = {
  id: number;
  progressNotes?: string;
  projectsComments?: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely';
  value?: number;
};
export type ReportProjectMetricEntriesPayload = {
  id: number;
  progressNotes?: string;
  projectsComments?: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely';
  value?: number;
};
export type ReportStandardMetricEntriesPayload = {
  id: number;
  progressNotes?: string;
  projectsComments?: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely';
  value?: number;
};
export type ReportSystemMetricEntriesPayload = {
  metric: 'Seeds Collected' | 'Seedlings' | 'Trees Planted' | 'Species Planted' | 'Hectares Planted' | 'Survival Rate';
  overrideValue?: number;
  progressNotes?: string;
  projectsComments?: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely';
};
export type UpdateAcceleratorReportValuesRequestPayload = {
  achievements: string[];
  additionalComments?: string;
  autoCalculatedIndicators?: ReportAutoCalculatedIndicatorEntriesPayload[];
  challenges: ReportChallengePayload[];
  commonIndicators?: ReportCommonIndicatorEntriesPayload[];
  financialSummaries?: string;
  highlights?: string;
  projectIndicators?: ReportProjectIndicatorEntriesPayload[];
  /** Use projectIndicators instead */
  projectMetrics?: ReportProjectMetricEntriesPayload[];
  /** Use commonIndicators instead */
  standardMetrics?: ReportStandardMetricEntriesPayload[];
  /** Use autoCalculatedIndicators instead */
  systemMetrics?: ReportSystemMetricEntriesPayload[];
};
export type ReviewAcceleratorReportIndicatorsRequestPayload = {
  autoCalculatedIndicators: ReportAutoCalculatedIndicatorEntriesPayload[];
  commonIndicators: ReportCommonIndicatorEntriesPayload[];
  projectIndicators: ReportProjectIndicatorEntriesPayload[];
};
export type ReviewAcceleratorReportMetricsRequestPayload = {
  projectMetrics: ReportProjectMetricEntriesPayload[];
  standardMetrics: ReportStandardMetricEntriesPayload[];
  systemMetrics: ReportSystemMetricEntriesPayload[];
};
export type UploadAcceleratorReportPhotoResponsePayload = {
  fileId: number;
  status: SuccessOrError;
};
export type UpdateAcceleratorReportPhotoRequestPayload = {
  caption?: string;
};
export type ReportReviewPayload = {
  achievements: string[];
  additionalComments?: string;
  challenges: ReportChallengePayload[];
  feedback?: string;
  financialSummaries?: string;
  highlights?: string;
  internalComment?: string;
  /** Must be unchanged if a report has not been submitted yet. */
  status: 'Not Submitted' | 'Submitted' | 'Approved' | 'Needs Update' | 'Not Needed';
};
export type ReviewAcceleratorReportRequestPayload = {
  review: ReportReviewPayload;
};
export const {
  useListAcceleratorReportsQuery,
  useLazyListAcceleratorReportsQuery,
  useUpdateAutoCalculatedIndicatorTargetMutation,
  useUpdateAutoCalculatedIndicatorBaselineTargetMutation,
  useGetAutoCalculatedIndicatorTargetsQuery,
  useLazyGetAutoCalculatedIndicatorTargetsQuery,
  useUpdateCommonIndicatorTargetMutation,
  useUpdateCommonIndicatorBaselineTargetMutation,
  useGetCommonIndicatorTargetsQuery,
  useLazyGetCommonIndicatorTargetsQuery,
  useListAcceleratorReportConfigQuery,
  useLazyListAcceleratorReportConfigQuery,
  useUpdateProjectAcceleratorReportConfigMutation,
  useCreateAcceleratorReportConfigMutation,
  useUpdateAcceleratorReportConfigMutation,
  useListProjectIndicatorsQuery,
  useLazyListProjectIndicatorsQuery,
  useCreateProjectIndicatorMutation,
  useUpdateProjectIndicatorMutation,
  useListProjectMetricsQuery,
  useLazyListProjectMetricsQuery,
  useCreateProjectMetricMutation,
  useUpdateProjectMetricMutation,
  useUpdateProjectIndicatorTargetMutation,
  useUpdateProjectIndicatorBaselineTargetMutation,
  useGetProjectIndicatorTargetsQuery,
  useLazyGetProjectIndicatorTargetsQuery,
  useUpdateProjectMetricTargetMutation,
  useGetProjectMetricTargetsQuery,
  useLazyGetProjectMetricTargetsQuery,
  useUpdateStandardMetricTargetMutation,
  useGetStandardMetricTargetsQuery,
  useLazyGetStandardMetricTargetsQuery,
  useUpdateSystemMetricTargetMutation,
  useGetSystemMetricTargetsQuery,
  useLazyGetSystemMetricTargetsQuery,
  useGetAcceleratorReportYearsQuery,
  useLazyGetAcceleratorReportYearsQuery,
  useGetAcceleratorReportQuery,
  useLazyGetAcceleratorReportQuery,
  useUpdateAcceleratorReportValuesMutation,
  useRefreshAcceleratorReportAutoCalculatedIndicatorsMutation,
  useReviewAcceleratorReportIndicatorsMutation,
  useRefreshAcceleratorReportSystemMetricsMutation,
  useReviewAcceleratorReportMetricsMutation,
  useUploadAcceleratorReportPhotoMutation,
  useDeleteAcceleratorReportPhotoMutation,
  useGetAcceleratorReportPhotoQuery,
  useLazyGetAcceleratorReportPhotoQuery,
  useUpdateAcceleratorReportPhotoMutation,
  usePublishAcceleratorReportMutation,
  useReviewAcceleratorReportMutation,
  useSubmitAcceleratorReportMutation,
} = injectedRtkApi;
