import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOneAcceleratorReport: build.query<GetOneAcceleratorReportApiResponse, GetOneAcceleratorReportApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/reports/${queryArg.reportId}`,
        params: {
          includeIndicators: queryArg.includeIndicators,
        },
      }),
    }),
    updateOneAcceleratorReportValues: build.mutation<
      UpdateOneAcceleratorReportValuesApiResponse,
      UpdateOneAcceleratorReportValuesApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/reports/${queryArg.reportId}`,
        method: 'POST',
        body: queryArg.updateAcceleratorReportValuesRequestPayload,
      }),
    }),
    refreshOneAcceleratorReportAutoCalculatedIndicators: build.mutation<
      RefreshOneAcceleratorReportAutoCalculatedIndicatorsApiResponse,
      RefreshOneAcceleratorReportAutoCalculatedIndicatorsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/reports/${queryArg.reportId}/indicators/refresh`,
        method: 'POST',
        params: {
          indicators: queryArg.indicators,
        },
      }),
    }),
    reviewOneAcceleratorReportIndicators: build.mutation<
      ReviewOneAcceleratorReportIndicatorsApiResponse,
      ReviewOneAcceleratorReportIndicatorsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/reports/${queryArg.reportId}/indicators/review`,
        method: 'POST',
        body: queryArg.reviewAcceleratorReportIndicatorsRequestPayload,
      }),
    }),
    uploadOneAcceleratorReportPhoto: build.mutation<
      UploadOneAcceleratorReportPhotoApiResponse,
      UploadOneAcceleratorReportPhotoApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/reports/${queryArg.reportId}/photos`,
        method: 'POST',
        body: queryArg.body,
      }),
    }),
    deleteOneAcceleratorReportPhoto: build.mutation<
      DeleteOneAcceleratorReportPhotoApiResponse,
      DeleteOneAcceleratorReportPhotoApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/reports/${queryArg.reportId}/photos/${queryArg.fileId}`,
        method: 'DELETE',
        body: queryArg.body,
      }),
    }),
    getOneAcceleratorReportPhoto: build.query<
      GetOneAcceleratorReportPhotoApiResponse,
      GetOneAcceleratorReportPhotoApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/reports/${queryArg.reportId}/photos/${queryArg.fileId}`,
        params: {
          maxWidth: queryArg.maxWidth,
          maxHeight: queryArg.maxHeight,
        },
      }),
    }),
    updateOneAcceleratorReportPhoto: build.mutation<
      UpdateOneAcceleratorReportPhotoApiResponse,
      UpdateOneAcceleratorReportPhotoApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/reports/${queryArg.reportId}/photos/${queryArg.fileId}`,
        method: 'PUT',
        body: queryArg.updateAcceleratorReportPhotoRequestPayload,
      }),
    }),
    publishOneAcceleratorReport: build.mutation<
      PublishOneAcceleratorReportApiResponse,
      PublishOneAcceleratorReportApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/accelerator/reports/${queryArg}/publish`, method: 'POST' }),
    }),
    reviewOneAcceleratorReport: build.mutation<ReviewOneAcceleratorReportApiResponse, ReviewOneAcceleratorReportApiArg>(
      {
        query: (queryArg) => ({
          url: `/api/v1/accelerator/reports/${queryArg.reportId}/review`,
          method: 'POST',
          body: queryArg.reviewAcceleratorReportRequestPayload,
        }),
      }
    ),
    submitOneAcceleratorReport: build.mutation<SubmitOneAcceleratorReportApiResponse, SubmitOneAcceleratorReportApiArg>(
      {
        query: (queryArg) => ({ url: `/api/v1/accelerator/reports/${queryArg}/submit`, method: 'POST' }),
      }
    ),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type GetOneAcceleratorReportApiResponse =
  /** status 200 The requested operation succeeded. */ GetAcceleratorReportResponsePayload;
export type GetOneAcceleratorReportApiArg = {
  reportId: number;
  includeIndicators?: boolean;
};
export type UpdateOneAcceleratorReportValuesApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateOneAcceleratorReportValuesApiArg = {
  reportId: number;
  updateAcceleratorReportValuesRequestPayload: UpdateAcceleratorReportValuesRequestPayload;
};
export type RefreshOneAcceleratorReportAutoCalculatedIndicatorsApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type RefreshOneAcceleratorReportAutoCalculatedIndicatorsApiArg = {
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
export type ReviewOneAcceleratorReportIndicatorsApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type ReviewOneAcceleratorReportIndicatorsApiArg = {
  reportId: number;
  reviewAcceleratorReportIndicatorsRequestPayload: ReviewAcceleratorReportIndicatorsRequestPayload;
};
export type UploadOneAcceleratorReportPhotoApiResponse =
  /** status 200 OK */ UploadAcceleratorReportPhotoResponsePayload;
export type UploadOneAcceleratorReportPhotoApiArg = {
  reportId: number;
  body: {
    caption?: string;
    file: Blob;
  };
};
export type DeleteOneAcceleratorReportPhotoApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type DeleteOneAcceleratorReportPhotoApiArg = {
  reportId: number;
  fileId: number;
  body: Blob;
};
export type GetOneAcceleratorReportPhotoApiResponse = /** status 200 The photo was successfully retrieved. */ Blob;
export type GetOneAcceleratorReportPhotoApiArg = {
  reportId: number;
  fileId: number;
  /** Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
  maxWidth?: number;
  /** Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
  maxHeight?: number;
};
export type UpdateOneAcceleratorReportPhotoApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateOneAcceleratorReportPhotoApiArg = {
  reportId: number;
  fileId: number;
  updateAcceleratorReportPhotoRequestPayload: UpdateAcceleratorReportPhotoRequestPayload;
};
export type PublishOneAcceleratorReportApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type PublishOneAcceleratorReportApiArg = number;
export type ReviewOneAcceleratorReportApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type ReviewOneAcceleratorReportApiArg = {
  reportId: number;
  reviewAcceleratorReportRequestPayload: ReviewAcceleratorReportRequestPayload;
};
export type SubmitOneAcceleratorReportApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type SubmitOneAcceleratorReportApiArg = number;
export type CumulativeIndicatorProgressPayload = {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  value: number;
};
export type ReportAutoCalculatedIndicatorPayload = {
  baseline?: number;
  category: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  classId: 'Lifetime Cumulative' | 'Not Cumulative' | 'Yearly Cumulative';
  /** If the indicator is cumulative, the list of actual values for all quarters in the report's year */
  currentYearProgress?: CumulativeIndicatorProgressPayload[];
  description?: string;
  endOfProjectTarget?: number;
  indicator:
    | 'Seeds Collected'
    | 'Seedlings'
    | 'Trees Planted'
    | 'Species Planted'
    | 'Hectares Planted'
    | 'Survival Rate';
  isPublishable: boolean;
  level: 'Process' | 'Output' | 'Outcome' | 'Goal';
  overrideValue?: number;
  precision: number;
  /** If the indicator is cumulative, the cumulative total at the end of the previous year */
  previousYearCumulativeTotal?: number;
  progressNotes?: string;
  projectsComments?: string;
  refId: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely' | 'Off-Track';
  supportingDocumentUrl?: string;
  systemTime?: string;
  systemValue?: number;
  target?: number;
  unit: string;
};
export type ReportChallengePayload = {
  challenge: string;
  mitigationPlan: string;
};
export type ReportCommonIndicatorPayload = {
  baseline?: number;
  category: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  classId: 'Lifetime Cumulative' | 'Not Cumulative' | 'Yearly Cumulative';
  /** If the indicator is cumulative, the list of actual values for all quarters in the report's year */
  currentYearProgress?: CumulativeIndicatorProgressPayload[];
  description?: string;
  endOfProjectTarget?: number;
  id: number;
  isPublishable: boolean;
  level: 'Process' | 'Output' | 'Outcome' | 'Goal';
  name: string;
  precision: number;
  /** If the indicator is cumulative, the cumulative total at the end of the previous year */
  previousYearCumulativeTotal?: number;
  progressNotes?: string;
  projectsComments?: string;
  refId: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely' | 'Off-Track';
  supportingDocumentUrl?: string;
  target?: number;
  unit?: string;
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
  baseline?: number;
  category: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  classId: 'Lifetime Cumulative' | 'Not Cumulative' | 'Yearly Cumulative';
  /** If the indicator is cumulative, the list of actual values for all quarters in the report's year */
  currentYearProgress?: CumulativeIndicatorProgressPayload[];
  description?: string;
  endOfProjectTarget?: number;
  id: number;
  isPublishable: boolean;
  level: 'Process' | 'Output' | 'Outcome' | 'Goal';
  name: string;
  precision: number;
  /** If the indicator is cumulative, the cumulative total at the end of the previous year */
  previousYearCumulativeTotal?: number;
  progressNotes?: string;
  projectsComments?: string;
  refId: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely' | 'Off-Track';
  supportingDocumentUrl?: string;
  target?: number;
  unit?: string;
  value?: number;
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
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  startDate: string;
  status: 'Not Submitted' | 'Submitted' | 'Approved' | 'Needs Update' | 'Not Needed';
  submittedBy?: number;
  submittedByUser?: SimpleUserPayload;
  submittedTime?: string;
  unpublishedProperties: (
    | 'achievements'
    | 'additionalComments'
    | 'autoCalculatedIndicators'
    | 'challenges'
    | 'commonIndicators'
    | 'financialSummaries'
    | 'highlights'
    | 'photos'
    | 'projectIndicators'
  )[];
};
export type SuccessOrError = 'ok' | 'error';
export type GetAcceleratorReportResponsePayload = {
  report: AcceleratorReportPayload;
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
  status?: 'Achieved' | 'On-Track' | 'Unlikely' | 'Off-Track';
  supportingDocumentUrl?: string;
};
export type ReportCommonIndicatorEntriesPayload = {
  id: number;
  progressNotes?: string;
  projectsComments?: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely' | 'Off-Track';
  supportingDocumentUrl?: string;
  value?: number;
};
export type ReportProjectIndicatorEntriesPayload = {
  id: number;
  progressNotes?: string;
  projectsComments?: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely' | 'Off-Track';
  supportingDocumentUrl?: string;
  value?: number;
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
};
export type ReviewAcceleratorReportIndicatorsRequestPayload = {
  autoCalculatedIndicators: ReportAutoCalculatedIndicatorEntriesPayload[];
  commonIndicators: ReportCommonIndicatorEntriesPayload[];
  projectIndicators: ReportProjectIndicatorEntriesPayload[];
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
  useGetOneAcceleratorReportQuery,
  useLazyGetOneAcceleratorReportQuery,
  useUpdateOneAcceleratorReportValuesMutation,
  useRefreshOneAcceleratorReportAutoCalculatedIndicatorsMutation,
  useReviewOneAcceleratorReportIndicatorsMutation,
  useUploadOneAcceleratorReportPhotoMutation,
  useDeleteOneAcceleratorReportPhotoMutation,
  useGetOneAcceleratorReportPhotoQuery,
  useLazyGetOneAcceleratorReportPhotoQuery,
  useUpdateOneAcceleratorReportPhotoMutation,
  usePublishOneAcceleratorReportMutation,
  useReviewOneAcceleratorReportMutation,
  useSubmitOneAcceleratorReportMutation,
} = injectedRtkApi;
