import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listPublishedReports: build.query<ListPublishedReportsApiResponse, ListPublishedReportsApiArg>({
      query: (queryArg) => ({ url: `/api/v1/funder/reports/projects/${queryArg}` }),
    }),
    getPublishedReportPhoto: build.query<GetPublishedReportPhotoApiResponse, GetPublishedReportPhotoApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/funder/reports/${queryArg.reportId}/photos/${queryArg.fileId}`,
        params: {
          maxWidth: queryArg.maxWidth,
          maxHeight: queryArg.maxHeight,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListPublishedReportsApiResponse =
  /** status 200 The requested operation succeeded. */ ListPublishedReportsResponsePayload;
export type ListPublishedReportsApiArg = number;
export type GetPublishedReportPhotoApiResponse = /** status 200 The photo was successfully retrieved. */ Blob;
export type GetPublishedReportPhotoApiArg = {
  reportId: number;
  fileId: number;
  /** Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
  maxWidth?: number;
  /** Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
  maxHeight?: number;
};
export type PublishedCumulativeIndicatorProgressPayload = {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  value: number;
};
export type PublishedReportIndicatorPayload = {
  baseline?: number;
  category: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  classId?: 'Cumulative' | 'Level';
  /** If the indicator is cumulative, the list of actual values for all quarters in the report's year. Note that only the report's quarter will be a published value, the rest will be current values whether or not they are the same as their published counterparts. */
  currentYearProgress?: PublishedCumulativeIndicatorProgressPayload[];
  description?: string;
  endOfProjectTarget?: number;
  level: 'Process' | 'Output' | 'Outcome' | 'Goal';
  name: string;
  /** If the indicator is cumulative, the cumulative total at the end of the previous year */
  previousYearCumulativeTotal?: number;
  progressNotes?: string;
  projectsComments?: string;
  refId: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely' | 'Off-Track';
  target?: number;
  unit?: string;
  value?: number;
};
export type ReportChallengePayload = {
  challenge: string;
  mitigationPlan: string;
};
export type ReportPhotoPayload = {
  caption?: string;
  fileId: number;
};
export type PublishedReportMetricPayload = {
  component: 'Project Objectives' | 'Climate' | 'Community' | 'Biodiversity';
  description?: string;
  name: string;
  progressNotes?: string;
  projectsComments?: string;
  reference: string;
  status?: 'Achieved' | 'On-Track' | 'Unlikely' | 'Off-Track';
  target?: number;
  type: 'Process' | 'Output' | 'Outcome' | 'Goal';
  unit?: string;
  value?: number;
};
export type PublishedReportPayload = {
  achievements: string[];
  additionalComments?: string;
  autoCalculatedIndicators: PublishedReportIndicatorPayload[];
  challenges: ReportChallengePayload[];
  commonIndicators: PublishedReportIndicatorPayload[];
  endDate: string;
  financialSummaries?: string;
  highlights?: string;
  photos: ReportPhotoPayload[];
  projectId: number;
  projectIndicators: PublishedReportIndicatorPayload[];
  /** Use projectIndicators instead */
  projectMetrics: PublishedReportMetricPayload[];
  projectName: string;
  publishedBy: number;
  publishedTime: string;
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  reportId: number;
  /** Use commonIndicators instead */
  standardMetrics: PublishedReportMetricPayload[];
  startDate: string;
  /** Use autoCalculatedIndicators instead */
  systemMetrics: PublishedReportMetricPayload[];
};
export type SuccessOrError = 'ok' | 'error';
export type ListPublishedReportsResponsePayload = {
  reports: PublishedReportPayload[];
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export const {
  useListPublishedReportsQuery,
  useLazyListPublishedReportsQuery,
  useGetPublishedReportPhotoQuery,
  useLazyGetPublishedReportPhotoQuery,
} = injectedRtkApi;
