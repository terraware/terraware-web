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
        },
      }),
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
    updateProjectMetricTargets: build.mutation<UpdateProjectMetricTargetsApiResponse, UpdateProjectMetricTargetsApiArg>(
      {
        query: (queryArg) => ({
          url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/targets`,
          method: 'POST',
          body: queryArg.updateMetricTargetsRequestPayload,
          params: {
            updateSubmitted: queryArg.updateSubmitted,
          },
        }),
      }
    ),
    getAcceleratorReport: build.query<GetAcceleratorReportApiResponse, GetAcceleratorReportApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/reports/${queryArg.reportId}`,
        params: {
          includeMetrics: queryArg.includeMetrics,
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
  includeMetrics?: boolean;
};
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
export type UpdateProjectMetricTargetsApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateProjectMetricTargetsApiArg = {
  projectId: number;
  /** Update targets for submitted reports. Require TF Experts privileges. */
  updateSubmitted?: boolean;
  updateMetricTargetsRequestPayload: UpdateMetricTargetsRequestPayload;
};
export type GetAcceleratorReportApiResponse =
  /** status 200 The requested operation succeeded. */ GetAcceleratorReportResponsePayload;
export type GetAcceleratorReportApiArg = {
  projectId: number;
  reportId: number;
  includeMetrics?: boolean;
};
export type UpdateAcceleratorReportValuesApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateAcceleratorReportValuesApiArg = {
  projectId: number;
  reportId: number;
  updateAcceleratorReportValuesRequestPayload: UpdateAcceleratorReportValuesRequestPayload;
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
export type ReportChallengePayload = {
  challenge: string;
  mitigationPlan: string;
};
export type SimpleUserPayload = {
  fullName: string;
  userId: number;
};
export type ReportPhotoPayload = {
  caption?: string;
  fileId: number;
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
  challenges: ReportChallengePayload[];
  endDate: string;
  feedback?: string;
  financialSummaries?: string;
  frequency: 'Quarterly' | 'Annual';
  highlights?: string;
  id: number;
  internalComment?: string;
  modifiedBy: number;
  modifiedByUser: SimpleUserPayload;
  modifiedTime: string;
  photos: ReportPhotoPayload[];
  projectId: number;
  projectMetrics: ReportProjectMetricPayload[];
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  standardMetrics: ReportStandardMetricPayload[];
  startDate: string;
  status: 'Not Submitted' | 'Submitted' | 'Approved' | 'Needs Update' | 'Not Needed';
  submittedBy?: number;
  submittedByUser?: SimpleUserPayload;
  submittedTime?: string;
  systemMetrics: ReportSystemMetricPayload[];
};
export type SuccessOrError = 'ok' | 'error';
export type ListAcceleratorReportsResponsePayload = {
  reports: AcceleratorReportPayload[];
  status: SuccessOrError;
};
export type ExistingAcceleratorReportConfigPayload = {
  configId: number;
  frequency: 'Quarterly' | 'Annual';
  logframeUrl?: string;
  projectId: number;
  reportingEndDate: string;
  reportingStartDate: string;
};
export type ListAcceleratorReportConfigResponsePayload = {
  configs: ExistingAcceleratorReportConfigPayload[];
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
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
export type ReportMetricTargetPayload = {
  reportId: number;
  target?: number;
};
export type UpdateMetricTargetsPayloadBase = {
  targets: ReportMetricTargetPayload[];
  type: string;
};
export type UpdateProjectMetricTargetsPayload = {
  type: 'project';
} & UpdateMetricTargetsPayloadBase & {
    metricId: number;
  };
export type UpdateStandardMetricTargetsPayload = {
  type: 'standard';
} & UpdateMetricTargetsPayloadBase & {
    metricId: number;
  };
export type UpdateSystemMetricTargetsPayload = {
  type: 'system';
} & UpdateMetricTargetsPayloadBase & {
    metric:
      | 'Seeds Collected'
      | 'Seedlings'
      | 'Trees Planted'
      | 'Species Planted'
      | 'Hectares Planted'
      | 'Survival Rate';
  };
export type UpdateMetricTargetsRequestPayload = {
  metric: UpdateProjectMetricTargetsPayload | UpdateStandardMetricTargetsPayload | UpdateSystemMetricTargetsPayload;
};
export type GetAcceleratorReportResponsePayload = {
  report: AcceleratorReportPayload;
  status: SuccessOrError;
};
export type ReportProjectMetricEntriesPayload = {
  id: number;
  progressNotes?: string;
  projectsComments?: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely';
  target?: number;
  value?: number;
};
export type ReportStandardMetricEntriesPayload = {
  id: number;
  progressNotes?: string;
  projectsComments?: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely';
  target?: number;
  value?: number;
};
export type ReportSystemMetricEntriesPayload = {
  metric: 'Seeds Collected' | 'Seedlings' | 'Trees Planted' | 'Species Planted' | 'Hectares Planted' | 'Survival Rate';
  overrideValue?: number;
  progressNotes?: string;
  projectsComments?: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely';
  target?: number;
};
export type UpdateAcceleratorReportValuesRequestPayload = {
  achievements: string[];
  additionalComments?: string;
  challenges: ReportChallengePayload[];
  financialSummaries?: string;
  highlights?: string;
  projectMetrics: ReportProjectMetricEntriesPayload[];
  standardMetrics: ReportStandardMetricEntriesPayload[];
  systemMetrics: ReportSystemMetricEntriesPayload[];
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
  useListAcceleratorReportConfigQuery,
  useLazyListAcceleratorReportConfigQuery,
  useUpdateProjectAcceleratorReportConfigMutation,
  useCreateAcceleratorReportConfigMutation,
  useUpdateAcceleratorReportConfigMutation,
  useListProjectMetricsQuery,
  useLazyListProjectMetricsQuery,
  useCreateProjectMetricMutation,
  useUpdateProjectMetricMutation,
  useUpdateProjectMetricTargetsMutation,
  useGetAcceleratorReportQuery,
  useLazyGetAcceleratorReportQuery,
  useUpdateAcceleratorReportValuesMutation,
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
