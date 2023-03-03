import { paths } from 'src/api/types/generated-schema';
import { ListReport, Report, ReportFile, ReportPhoto, ReportSeedBank } from 'src/types/Report';
import HttpService, { Response } from './HttpService';
import { Facility } from 'src/types/Facility';

/**
 * Report related services
 */

const REPORTS_ENDPOINT = '/api/v1/reports';
const REPORT_ENDPOINT = '/api/v1/reports/{id}';
const REPORT_FILES_ENDPOINT = '/api/v1/reports/{id}/files';
const REPORT_FILE_ENDPOINT = '/api/v1/reports/{reportId}/files/{fileId}';
const LOCK_REPORT_ENDPOINT = '/api/v1/reports/{id}/lock';
const FORCE_LOCK_REPORT_ENDPOINT = '/api/v1/reports/{id}/lock/force';
const REPORT_PHOTOS_ENDPOINT = '/api/v1/reports/{id}/photos';
const SUBMIT_REPORT_ENDPOINT = '/api/v1/reports/{id}/submit';
const UNLOCK_REPORT_ENDPOINT = '/api/v1/reports/{id}/unlock';
const UPLOAD_REPORT_FILES_ENDPOINT = '/api/v1/reports/{reportId}/files';
const UPLOAD_REPORT_PHOTO_ENDPOINT = '/api/v1/reports/{reportId}/photos';
const REPORT_PHOTO_ENDPOINT = '/api/v1/reports/{reportId}/photos/{photoId}';

type ReportsResponsePayload = paths[typeof REPORTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type ReportResponsePayload = paths[typeof REPORT_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type ReportFilesResponsePayload =
  paths[typeof REPORT_FILES_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type ReportFileResponsePayload = paths[typeof REPORT_FILE_ENDPOINT]['get']['responses'][200]['content'];
type ReportPhotosResponsePayload =
  paths[typeof REPORT_PHOTOS_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type UploadReportFileResponsePayload =
  paths[typeof UPLOAD_REPORT_FILES_ENDPOINT]['post']['responses'][200]['content']['application/json'];
type UploadReportPhotoResponsePayload =
  paths[typeof UPLOAD_REPORT_PHOTO_ENDPOINT]['post']['responses'][200]['content']['application/json'];
type ReportPhotoResponsePayload = paths[typeof REPORT_PHOTO_ENDPOINT]['get']['responses'][200]['content'];

type UpdateReportRequestPayload = paths[typeof REPORT_ENDPOINT]['put']['requestBody']['content']['application/json'];

type DownloadReportFileResponsePayload = {
  file?: ReportFileResponsePayload;
  status?: 'ok' | 'error';
};

type DownloadReportPhotoResponsePayload = {
  photo?: ReportPhotoResponsePayload;
  status?: 'ok' | 'error';
};

export type Reports = ListReport[];
export type ReportFiles = ReportFile[];
export type ReportPhotos = ReportPhoto[];

/**
 * exported types
 */
export type ReportsData = {
  reports?: Reports;
};
export type ReportData = {
  report?: Report;
};
export type ReportFilesData = {
  files?: ReportFiles;
};
export type ReportFileData = {
  file?: ReportFileResponsePayload;
};
export type ReportPhotosData = {
  photos?: ReportPhotos;
};

export type UploadReportFileData = {
  fileId?: number;
};

export type UploadReportPhotoData = {
  fileId?: number;
};
export type ReportPhotoData = {
  photo?: ReportPhotoResponsePayload;
};

export type ReportsResponse = Response & ReportsData;
export type ReportResponse = Response & ReportData;
export type ReportFilesResponse = Response & ReportFilesData;
export type ReportFileResponse = Response & ReportFileData;
export type ReportPhotosResponse = Response & ReportPhotosData;
export type UploadReportFileResponse = Response & UploadReportFileData;
export type UploadReportPhotoResponse = Response & UploadReportPhotoData;
export type ReportPhotoResponse = Response & ReportPhotoData;

export type ReportUpdateRequestBody =
  paths[typeof REPORT_ENDPOINT]['put']['requestBody']['content']['application/json'];

const httpReports = HttpService.root(REPORTS_ENDPOINT);
const httpReport = HttpService.root(REPORT_ENDPOINT);
const httpReportFiles = HttpService.root(REPORT_FILES_ENDPOINT);
const httpReportFile = HttpService.root(REPORT_FILE_ENDPOINT);
const httpLockReport = HttpService.root(LOCK_REPORT_ENDPOINT);
const httpForceLockReport = HttpService.root(FORCE_LOCK_REPORT_ENDPOINT);
const httpReportPhotos = HttpService.root(REPORT_PHOTOS_ENDPOINT);
const httpSubmitReport = HttpService.root(SUBMIT_REPORT_ENDPOINT);
const httpUnlockReport = HttpService.root(UNLOCK_REPORT_ENDPOINT);
const httpUploadReportFile = HttpService.root(UPLOAD_REPORT_FILES_ENDPOINT);
const httpUploadReportPhoto = HttpService.root(UPLOAD_REPORT_PHOTO_ENDPOINT);
const httpReportPhoto = HttpService.root(REPORT_PHOTO_ENDPOINT);

/**
 * Get all reports
 */
const getReports = async (organizationId: number): Promise<ReportsResponse> => {
  const params = { organizationId: organizationId.toString() };
  const response: ReportsResponse = await httpReports.get<ReportsResponsePayload, ReportsData>(
    {
      params,
    },
    (data) => ({
      reports: data?.reports,
    })
  );

  return response;
};

/**
 * Get a single report
 */
const getReport = async (reportId: number): Promise<ReportResponse> => {
  const response: ReportResponse = await httpReport.get<ReportResponsePayload, ReportData>(
    {
      urlReplacements: {
        '{id}': reportId.toString(),
      },
    },
    (data) => ({ report: data?.report })
  );

  return response;
};

/**
 * Update a single report
 */
const updateReport = async (report: Report): Promise<Response> => {
  const request: UpdateReportRequestPayload = {
    report,
  };

  const response: Response = await httpReport.put({
    entity: request,
    urlReplacements: {
      '{id}': report.id.toString(),
    },
  });

  return response;
};

/**
 * Get report files
 */
const getReportFiles = async (reportId: number): Promise<ReportFilesResponse> => {
  const response: ReportFilesResponse = await httpReportFiles.get<ReportFilesResponsePayload, ReportFilesData>(
    {
      urlReplacements: {
        '{id}': reportId.toString(),
      },
    },
    (data) => ({ files: data?.files })
  );

  return response;
};

/**
 * upload report file
 */
const uploadReportFile = async (file: string): Promise<UploadReportFileResponse> => {
  const response: UploadReportFileResponse = await httpUploadReportFile.post({ entity: { file } });

  if (response.requestSucceeded) {
    const data: UploadReportFileResponsePayload = response.data;
    response.fileId = data?.fileId;
  }

  return response;
};

/**
 * download report file
 */
const downloadReportFile = async (reportId: number, fileId: number): Promise<DownloadReportFileResponsePayload> => {
  const response: ReportFileResponse = await httpReportFile.get<DownloadReportFileResponsePayload, ReportFileData>(
    {
      urlReplacements: {
        '{reportId}': reportId.toString(),
        '{fileId}': fileId.toString(),
      },
    },
    (data) => ({ file: data?.file })
  );

  return response;
};

/**
 * delete report file
 */
const deleteReportFile = async (reportId: number, fileId: number): Promise<Response> => {
  return await httpReportFile.delete({
    urlReplacements: {
      '{reportId}': reportId.toString(),
      '{fileId}': fileId.toString(),
    },
  });
};

/**
 * Lock report (Only succeeds if the report is not currently locked or if it is locked by the current user)
 */
const lockReport = async (id: number): Promise<Response> => {
  const response: Response = await httpLockReport.post({
    urlReplacements: {
      '{id}': id.toString(),
    },
    entity: {},
  });

  return response;
};

/**
 * Force lock report
 */
const forceLockReport = async (id: number): Promise<Response> => {
  const response: Response = await httpForceLockReport.post({
    urlReplacements: {
      '{id}': id.toString(),
    },
    entity: {},
  });

  return response;
};

/**
 * Unlock report
 */
const unlockReport = async (id: number): Promise<Response> => {
  const response: Response = await httpUnlockReport.post({
    urlReplacements: {
      '{id}': id.toString(),
    },
    entity: {},
  });

  return response;
};

/**
 * Get report photos
 */
const getReportPhotos = async (reportId: number): Promise<ReportPhotosResponse> => {
  const response: ReportPhotosResponse = await httpReportPhotos.get<ReportPhotosResponsePayload, ReportPhotosData>(
    {
      urlReplacements: {
        '{id}': reportId.toString(),
      },
    },
    (data) => ({ photos: data?.photos })
  );

  return response;
};

/**
 * Submit report
 */
const submitReport = async (id: number): Promise<Response> => {
  const response: Response = await httpSubmitReport.post({
    urlReplacements: {
      '{id}': id.toString(),
    },
    entity: {},
  });

  return response;
};

/**
 * upload report photo
 */
const uploadReportPhoto = async (file: string): Promise<UploadReportPhotoResponse> => {
  const response: UploadReportPhotoResponse = await httpUploadReportPhoto.post({ entity: { file } });

  if (response.requestSucceeded) {
    const data: UploadReportPhotoResponsePayload = response.data;
    response.fileId = data?.fileId;
  }

  return response;
};

/**
 * Get a report photo
 */
const getReportPhoto = async (reportId: number, photoId: number): Promise<ReportPhotoResponse> => {
  const response: ReportPhotoResponse = await httpReportPhoto.get<DownloadReportPhotoResponsePayload, ReportPhotoData>(
    {
      urlReplacements: {
        '{reportId}': reportId.toString(),
        '{photoId}': photoId.toString(),
      },
    },
    (data) => ({ photo: data?.photo })
  );

  return response;
};

/**
 * Updatea report photo
 */
const updateReportPhoto = async (reportId: number, photoId: number, caption: string): Promise<Response> => {
  return await httpReportPhoto.put({
    urlReplacements: {
      '{reportId}': reportId.toString(),
      '{photoId}': photoId.toString(),
    },
    entity: { caption },
  });
};

/**
 * delete report file
 */
const deleteReportPhoto = async (reportId: number, fileId: number): Promise<Response> => {
  return await httpReportPhoto.delete({
    urlReplacements: {
      '{reportId}': reportId.toString(),
      '{fileId}': fileId.toString(),
    },
  });
};

/**
 * Convert Facility to ReportSeedBank
 */
const seedbankFromFacility = (facility: Facility, originalReport: Report): ReportSeedBank => {
  const existingSeedbank = originalReport.seedBanks?.find((sb) => sb.id === facility.id);
  if (existingSeedbank) {
    return existingSeedbank;
  }

  return {
    id: facility.id,
    name: facility.name,
    buildCompletedDateEditable: true,
    buildStartedDateEditable: true,
    operationStartedDateEditable: true,
    totalSeedsStored: 0,
    workers: {},
  };
};

/**
 * Exported functions
 */
const ReportService = {
  getReports,
  getReport,
  updateReport,
  getReportFiles,
  uploadReportFile,
  downloadReportFile,
  deleteReportFile,
  lockReport,
  forceLockReport,
  unlockReport,
  getReportPhotos,
  submitReport,
  uploadReportPhoto,
  getReportPhoto,
  updateReportPhoto,
  deleteReportPhoto,
  seedbankFromFacility,
};

export default ReportService;
