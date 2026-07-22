import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listReports: build.query<ListReportsApiResponse, ListReportsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/reports`,
        params: {
          organizationId: queryArg,
        },
      }),
    }),
    getReportSettings: build.query<GetReportSettingsApiResponse, GetReportSettingsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/reports/settings`,
        params: {
          organizationId: queryArg,
        },
      }),
    }),
    updateReportSettings: build.mutation<UpdateReportSettingsApiResponse, UpdateReportSettingsApiArg>({
      query: (queryArg) => ({ url: `/api/v1/reports/settings`, method: 'PUT', body: queryArg }),
    }),
    getReport: build.query<GetReportApiResponse, GetReportApiArg>({
      query: (queryArg) => ({ url: `/api/v1/reports/${queryArg}` }),
    }),
    updateReport: build.mutation<UpdateReportApiResponse, UpdateReportApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/reports/${queryArg.id}`,
        method: 'PUT',
        body: queryArg.putReportRequestPayload,
      }),
    }),
    listReportFiles: build.query<ListReportFilesApiResponse, ListReportFilesApiArg>({
      query: (queryArg) => ({ url: `/api/v1/reports/${queryArg}/files` }),
    }),
    lockReport: build.mutation<LockReportApiResponse, LockReportApiArg>({
      query: (queryArg) => ({ url: `/api/v1/reports/${queryArg}/lock`, method: 'POST' }),
    }),
    forceLockReport: build.mutation<ForceLockReportApiResponse, ForceLockReportApiArg>({
      query: (queryArg) => ({ url: `/api/v1/reports/${queryArg}/lock/force`, method: 'POST' }),
    }),
    listReportPhotos: build.query<ListReportPhotosApiResponse, ListReportPhotosApiArg>({
      query: (queryArg) => ({ url: `/api/v1/reports/${queryArg}/photos` }),
    }),
    submitReport: build.mutation<SubmitReportApiResponse, SubmitReportApiArg>({
      query: (queryArg) => ({ url: `/api/v1/reports/${queryArg}/submit`, method: 'POST' }),
    }),
    unlockReport: build.mutation<UnlockReportApiResponse, UnlockReportApiArg>({
      query: (queryArg) => ({ url: `/api/v1/reports/${queryArg}/unlock`, method: 'POST' }),
    }),
    uploadReportFile: build.mutation<UploadReportFileApiResponse, UploadReportFileApiArg>({
      query: (queryArg) => ({ url: `/api/v1/reports/${queryArg.reportId}/files`, method: 'POST', body: queryArg.body }),
    }),
    deleteReportFile: build.mutation<DeleteReportFileApiResponse, DeleteReportFileApiArg>({
      query: (queryArg) => ({ url: `/api/v1/reports/${queryArg.reportId}/files/${queryArg.fileId}`, method: 'DELETE' }),
    }),
    downloadReportFile: build.query<DownloadReportFileApiResponse, DownloadReportFileApiArg>({
      query: (queryArg) => ({ url: `/api/v1/reports/${queryArg.reportId}/files/${queryArg.fileId}` }),
    }),
    uploadReportPhoto: build.mutation<UploadReportPhotoApiResponse, UploadReportPhotoApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/reports/${queryArg.reportId}/photos`,
        method: 'POST',
        body: queryArg.body,
      }),
    }),
    deleteReportPhoto: build.mutation<DeleteReportPhotoApiResponse, DeleteReportPhotoApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/reports/${queryArg.reportId}/photos/${queryArg.photoId}`,
        method: 'DELETE',
      }),
    }),
    getReportPhoto: build.query<GetReportPhotoApiResponse, GetReportPhotoApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/reports/${queryArg.reportId}/photos/${queryArg.photoId}`,
        params: {
          maxWidth: queryArg.maxWidth,
          maxHeight: queryArg.maxHeight,
        },
      }),
    }),
    updateReportPhoto: build.mutation<UpdateReportPhotoApiResponse, UpdateReportPhotoApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/reports/${queryArg.reportId}/photos/${queryArg.photoId}`,
        method: 'PUT',
        body: queryArg.updateReportPhotoRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListReportsApiResponse = /** status 200 OK */ ListReportsResponsePayload;
export type ListReportsApiArg = number;
export type GetReportSettingsApiResponse = /** status 200 OK */ GetReportSettingsResponsePayload;
export type GetReportSettingsApiArg = number;
export type UpdateReportSettingsApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateReportSettingsApiArg = UpdateReportSettingsRequestPayload;
export type GetReportApiResponse = /** status 200 OK */ GetReportResponsePayload;
export type GetReportApiArg = number;
export type UpdateReportApiResponse = /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateReportApiArg = {
  id: number;
  putReportRequestPayload: PutReportRequestPayload;
};
export type ListReportFilesApiResponse = /** status 200 OK */ ListReportFilesResponsePayload;
export type ListReportFilesApiArg = number;
export type LockReportApiResponse =
  /** status 200 The report is now locked by the current user. */ SimpleSuccessResponsePayload;
export type LockReportApiArg = number;
export type ForceLockReportApiResponse =
  /** status 200 The report is now locked by the current user. */ SimpleSuccessResponsePayload;
export type ForceLockReportApiArg = number;
export type ListReportPhotosApiResponse = /** status 200 OK */ ListReportPhotosResponsePayload;
export type ListReportPhotosApiArg = number;
export type SubmitReportApiResponse = /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type SubmitReportApiArg = number;
export type UnlockReportApiResponse = /** status 200 The report is no longer locked. */ SimpleSuccessResponsePayload;
export type UnlockReportApiArg = number;
export type UploadReportFileApiResponse = /** status 200 OK */ UploadReportFileResponsePayload;
export type UploadReportFileApiArg = {
  reportId: number;
  body: {
    file: Blob;
  };
};
export type DeleteReportFileApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteReportFileApiArg = {
  reportId: number;
  fileId: number;
};
export type DownloadReportFileApiResponse = /** status 200 The file was successfully retrieved. */ Blob;
export type DownloadReportFileApiArg = {
  reportId: number;
  fileId: number;
};
export type UploadReportPhotoApiResponse = /** status 200 OK */ UploadReportFileResponsePayload;
export type UploadReportPhotoApiArg = {
  reportId: number;
  body: {
    file: Blob;
  };
};
export type DeleteReportPhotoApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteReportPhotoApiArg = {
  reportId: number;
  photoId: number;
};
export type GetReportPhotoApiResponse = unknown;
export type GetReportPhotoApiArg = {
  reportId: number;
  photoId: number;
  /** Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
  maxWidth?: number;
  /** Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
  maxHeight?: number;
};
export type UpdateReportPhotoApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateReportPhotoApiArg = {
  reportId: number;
  photoId: number;
  updateReportPhotoRequestPayload: UpdateReportPhotoRequestPayload;
};
export type ListReportsResponseElement = {
  id: number;
  lockedByName?: string;
  lockedByUserId?: number;
  lockedTime?: string;
  modifiedByName?: string;
  modifiedByUserId?: number;
  modifiedTime?: string;
  projectId?: number;
  projectName?: string;
  quarter: number;
  status: 'New' | 'In Progress' | 'Locked' | 'Submitted';
  submittedByName?: string;
  submittedByUserId?: number;
  submittedTime?: string;
  year: number;
};
export type SuccessOrError = 'ok' | 'error';
export type ListReportsResponsePayload = {
  reports: ListReportsResponseElement[];
  status: SuccessOrError;
};
export type ProjectReportSettingsPayload = {
  /** If true, reports are enabled for this project. */
  isEnabled: boolean;
  projectId: number;
};
export type GetReportSettingsResponsePayload = {
  /** If false, settings have not been configured yet and the values in the rest of the payload are the defaults. */
  isConfigured: boolean;
  /** If true, organization-level reports are enabled. */
  organizationEnabled: boolean;
  /** Per-project report settings. */
  projects: ProjectReportSettingsPayload[];
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type UpdateReportSettingsRequestPayload = {
  /** If true, enable organization-level reports. */
  organizationEnabled: boolean;
  organizationId: number;
  /** Per-project report settings. If a project is missing from this list, its settings will revert to the defaults. */
  projects: ProjectReportSettingsPayload[];
};
export type GetReportPayloadBase = {
  id: number;
  lockedByName?: string;
  lockedByUserId?: number;
  lockedTime?: string;
  modifiedByName?: string;
  modifiedByUserId?: number;
  modifiedTime?: string;
  projectId?: number;
  projectName?: string;
  quarter: number;
  status: 'New' | 'In Progress' | 'Locked' | 'Submitted';
  submittedByName?: string;
  submittedByUserId?: number;
  submittedTime?: string;
  version: string;
  year: number;
};
export type GoalProgressPayloadV1 = {
  goal: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;
  progress?: string;
};
export type AnnualDetailsPayloadV1 = {
  bestMonthsForObservation: number[];
  budgetNarrativeSummary?: string;
  catalyticDetail?: string;
  challenges?: string;
  isCatalytic: boolean;
  keyLessons?: string;
  nextSteps?: string;
  opportunities?: string;
  projectImpact?: string;
  projectSummary?: string;
  socialImpact?: string;
  successStories?: string;
  sustainableDevelopmentGoals: GoalProgressPayloadV1[];
};
export type WorkersPayloadV1 = {
  femalePaidWorkers?: number;
  paidWorkers?: number;
  volunteers?: number;
};
export type GetNurseryV1 = {
  buildCompletedDate?: string;
  buildCompletedDateEditable: boolean;
  buildStartedDate?: string;
  buildStartedDateEditable: boolean;
  capacity?: number;
  id: number;
  mortalityRate: number;
  name: string;
  notes?: string;
  operationStartedDate?: string;
  operationStartedDateEditable: boolean;
  selected: boolean;
  totalPlantsPropagated: number;
  totalPlantsPropagatedForProject?: number;
  workers: WorkersPayloadV1;
};
export type GetPlantingSiteSpeciesV1 = {
  id: number;
  mortalityRateInField?: number;
  totalPlanted?: number;
};
export type GetPlantingSiteV1 = {
  id: number;
  mortalityRate?: number;
  name: string;
  notes?: string;
  selected: boolean;
  species: GetPlantingSiteSpeciesV1[];
  totalPlantedArea?: number;
  totalPlantingSiteArea?: number;
  totalPlantsPlanted?: number;
  totalTreesPlanted?: number;
  workers: WorkersPayloadV1;
};
export type GetSeedBankV1 = {
  buildCompletedDate?: string;
  buildCompletedDateEditable: boolean;
  buildStartedDate?: string;
  buildStartedDateEditable: boolean;
  id: number;
  name: string;
  notes?: string;
  operationStartedDate?: string;
  operationStartedDateEditable: boolean;
  selected: boolean;
  totalSeedsStored: number;
  totalSeedsStoredForProject?: number;
  workers: WorkersPayloadV1;
};
export type GetReportPayloadV1 = {
  version: '1';
} & GetReportPayloadBase & {
    annualDetails?: AnnualDetailsPayloadV1;
    isAnnual: boolean;
    notes?: string;
    nurseries: GetNurseryV1[];
    organizationName: string;
    plantingSites: GetPlantingSiteV1[];
    seedBanks: GetSeedBankV1[];
    summaryOfProgress?: string;
    totalNurseries: number;
    totalPlantingSites: number;
    totalSeedBanks: number;
  };
export type GetReportResponsePayload = {
  report: GetReportPayloadV1;
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type PutReportPayloadBase = {
  version: string;
};
export type PutNurseryV1 = {
  buildCompletedDate?: string;
  buildStartedDate?: string;
  capacity?: number;
  id: number;
  notes?: string;
  operationStartedDate?: string;
  selected: boolean;
  workers: WorkersPayloadV1;
};
export type PutPlantingSiteSpeciesV1 = {
  id: number;
  mortalityRateInField?: number;
  totalPlanted?: number;
};
export type PutPlantingSiteV1 = {
  id: number;
  mortalityRate?: number;
  notes?: string;
  selected: boolean;
  species: PutPlantingSiteSpeciesV1[];
  totalPlantedArea?: number;
  totalPlantingSiteArea?: number;
  totalPlantsPlanted?: number;
  totalTreesPlanted?: number;
  workers: WorkersPayloadV1;
};
export type PutSeedBankV1 = {
  buildCompletedDate?: string;
  buildStartedDate?: string;
  id: number;
  notes?: string;
  operationStartedDate?: string;
  selected: boolean;
  workers: WorkersPayloadV1;
};
export type PutReportPayloadV1 = {
  version: '1';
} & PutReportPayloadBase & {
    annualDetails?: AnnualDetailsPayloadV1;
    notes?: string;
    nurseries: PutNurseryV1[];
    plantingSites: PutPlantingSiteV1[];
    seedBanks: PutSeedBankV1[];
    summaryOfProgress?: string;
  };
export type PutReportRequestPayload = {
  report: PutReportPayloadV1;
};
export type ListReportFilesResponseElement = {
  filename: string;
  id: number;
};
export type ListReportFilesResponsePayload = {
  files: ListReportFilesResponseElement[];
  status: SuccessOrError;
};
export type ListReportPhotosResponseElement = {
  caption?: string;
  filename: string;
  id: number;
};
export type ListReportPhotosResponsePayload = {
  photos: ListReportPhotosResponseElement[];
  status: SuccessOrError;
};
export type UploadReportFileResponsePayload = {
  id: number;
  status: SuccessOrError;
};
export type UpdateReportPhotoRequestPayload = {
  caption?: string;
};
export const {
  useListReportsQuery,
  useLazyListReportsQuery,
  useGetReportSettingsQuery,
  useLazyGetReportSettingsQuery,
  useUpdateReportSettingsMutation,
  useGetReportQuery,
  useLazyGetReportQuery,
  useUpdateReportMutation,
  useListReportFilesQuery,
  useLazyListReportFilesQuery,
  useLockReportMutation,
  useForceLockReportMutation,
  useListReportPhotosQuery,
  useLazyListReportPhotosQuery,
  useSubmitReportMutation,
  useUnlockReportMutation,
  useUploadReportFileMutation,
  useDeleteReportFileMutation,
  useDownloadReportFileQuery,
  useLazyDownloadReportFileQuery,
  useUploadReportPhotoMutation,
  useDeleteReportPhotoMutation,
  useGetReportPhotoQuery,
  useLazyGetReportPhotoQuery,
  useUpdateReportPhotoMutation,
} = injectedRtkApi;
