import addQueryParams from 'src/api/helpers/addQueryParams';
import { paths } from 'src/api/types/generated-schema';
import {
  AcceleratorReport,
  CreateAcceleratorReportConfigRequest,
  CreateProjectMetricRequest,
  CreateStandardMetricRequestPayload,
  ExistingAcceleratorReportConfig,
  ReportReviewPayload,
  ReviewAcceleratorReportMetricsRequestPayload,
  SystemMetricName,
  UpdateAcceleratorReportConfigPayload,
  UpdateProjectMetricRequest,
  UpdateStandardMetricRequestPayload,
} from 'src/types/AcceleratorReport';
import { UpdateReportMetricTargets } from 'src/types/Report';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { SearchOrderConfig, searchAndSort } from 'src/utils/searchAndSort';

import HttpService, { Response, Response2 } from './HttpService';

export type ReportsConfigData = {
  config?: ExistingAcceleratorReportConfig;
};

export type AcceleratorReportsData = {
  reports?: AcceleratorReport[];
};

export type ReportsConfigResponse = Response & ReportsConfigData;

const ACCELERATOR_REPORT_CONFIG_ENDPOINT = '/api/v1/accelerator/projects/{projectId}/reports/configs';

const ACCELERATOR_REPORT_SINGLE_CONFIG_ENDPOINT = '/api/v1/accelerator/projects/{projectId}/reports/configs/{configId}';

type ListAcceleratorReportConfigResponsePayload =
  paths[typeof ACCELERATOR_REPORT_CONFIG_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const httpAcceleratorReportsConfig = HttpService.root(ACCELERATOR_REPORT_CONFIG_ENDPOINT);

type CreateResponse =
  paths[typeof ACCELERATOR_REPORT_CONFIG_ENDPOINT]['put']['responses'][200]['content']['application/json'];

const PROJECT_REPORTS_ENDPOINT = '/api/v1/accelerator/projects/{projectId}/reports';
type UpdateConfigResponse =
  paths[typeof ACCELERATOR_REPORT_SINGLE_CONFIG_ENDPOINT]['post']['responses'][200]['content']['application/json'];

const PROJECT_METRICS_ENDPOINT = '/api/v1/accelerator/projects/{projectId}/reports/metrics';
const STANDARD_METRICS_ENDPOINT = '/api/v1/accelerator/reports/standardMetrics';
const STANDARD_METRIC_ENDPOINT = '/api/v1/accelerator/reports/standardMetrics/{metricId}';
const SYSTEM_METRICS_ENDPOINT = '/api/v1/accelerator/reports/systemMetrics';
const PROJECT_METRIC_ENDPOINT = '/api/v1/accelerator/projects/{projectId}/reports/metrics/{metricId}';
const REVIEW_ACCELERATOR_REPORT_METRICS_ENDPOINT =
  '/api/v1/accelerator/projects/{projectId}/reports/{reportId}/metrics/review';
const REFRESH_ACCELERATOR_REPORT_METRICS_ENDPOINT =
  '/api/v1/accelerator/projects/{projectId}/reports/{reportId}/metrics/refresh';
const REVIEW_ACCELERATOR_REPORT_ENDPOINT = '/api/v1/accelerator/projects/{projectId}/reports/{reportId}/review';
const SUBMIT_ACCELERATOR_REPORT_ENDPOINT = '/api/v1/accelerator/projects/{projectId}/reports/{reportId}/submit';
const ACCELERATOR_REPORT_ENDPOINT = '/api/v1/accelerator/projects/{projectId}/reports/{reportId}';
const PUBLISH_ACCELERATOR_REPORT_ENDPOINT = '/api/v1/accelerator/projects/{projectId}/reports/{reportId}/publish';
const UPDATE_REPORT_TARGET_ENDPOINT = '/api/v1/accelerator/projects/{projectId}/reports/targets';
export const ACCELERATOR_REPORT_PHOTO_ENDPOINT =
  '/api/v1/accelerator/projects/{projectId}/reports/{reportId}/photos/{fileId}';
export const FUNDER_REPORT_PHOTO_ENDPOINT = '/api/v1/funder/reports/{reportId}/photos/{fileId}';

type GetAcceleratorReportResponsePayload =
  paths[typeof ACCELERATOR_REPORT_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type UpdateAcceleratorReportResponse =
  paths[typeof ACCELERATOR_REPORT_ENDPOINT]['post']['responses'][200]['content']['application/json'];

type SubmitAcceleratorReportResponse =
  paths[typeof SUBMIT_ACCELERATOR_REPORT_ENDPOINT]['post']['responses'][200]['content']['application/json'];

type PublishAcceleratorReportResponse =
  paths[typeof PUBLISH_ACCELERATOR_REPORT_ENDPOINT]['post']['responses'][200]['content']['application/json'];

export type ListProjectMetricsResponsePayload =
  paths[typeof PROJECT_METRICS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type ListStandardMetricsResponsePayload =
  paths[typeof STANDARD_METRICS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type ListSystemMetricsResponsePayload =
  paths[typeof SYSTEM_METRICS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type CreateProjectMetricResponse =
  paths[typeof PROJECT_METRICS_ENDPOINT]['put']['responses'][200]['content']['application/json'];

type CreateStandardMetricResponse =
  paths[typeof STANDARD_METRICS_ENDPOINT]['put']['responses'][200]['content']['application/json'];

type ListAcceleratorReportsResponsePayload =
  paths[typeof PROJECT_REPORTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type UpdateProjectMetricResponse =
  paths[typeof PROJECT_METRIC_ENDPOINT]['post']['responses'][200]['content']['application/json'];
type UpdateStandardMetricResponse =
  paths[typeof STANDARD_METRIC_ENDPOINT]['post']['responses'][200]['content']['application/json'];
type ReviewAcceleratorReportMetricsResponse =
  paths[typeof REVIEW_ACCELERATOR_REPORT_METRICS_ENDPOINT]['post']['responses'][200]['content']['application/json'];
type RefreshAcceleratorReportSystemMetricsResponse =
  paths[typeof REFRESH_ACCELERATOR_REPORT_METRICS_ENDPOINT]['post']['responses'][200]['content']['application/json'];
type RefreshQuery = paths[typeof REFRESH_ACCELERATOR_REPORT_METRICS_ENDPOINT]['post']['parameters']['query'];

type ReviewAcceleratorReportResponse =
  paths[typeof REVIEW_ACCELERATOR_REPORT_ENDPOINT]['post']['responses'][200]['content']['application/json'];

export type ListAcceleratorReportsRequestParams = paths[typeof PROJECT_REPORTS_ENDPOINT]['get']['parameters']['query'];

export type UpdateReportTargetResponse =
  paths[typeof UPDATE_REPORT_TARGET_ENDPOINT]['post']['responses'][200]['content']['application/json'];

/**
 * Get project reports config
 */
const getAcceleratorReportConfig = async (projectId: string): Promise<ReportsConfigResponse> => {
  const response: ReportsConfigResponse = await httpAcceleratorReportsConfig.get<
    ListAcceleratorReportConfigResponsePayload,
    ReportsConfigData
  >(
    {
      urlReplacements: {
        '{projectId}': projectId,
      },
    },
    (data) => ({ config: data?.configs[0] })
  );

  return response;
};

const getAcceleratorReport = async (
  projectId: string,
  reportId: string,
  includeMetrics?: boolean
): Promise<Response2<GetAcceleratorReportResponsePayload>> => {
  const params = { includeMetrics: (!!includeMetrics).toString() };

  return HttpService.root(
    ACCELERATOR_REPORT_ENDPOINT.replace('{projectId}', projectId).replace('{reportId}', reportId)
  ).get2<GetAcceleratorReportResponsePayload>({
    params,
  });
};

const createConfig = async (request: CreateAcceleratorReportConfigRequest): Promise<Response2<CreateResponse>> => {
  const { projectId, ...rest } = request;
  return HttpService.root(
    ACCELERATOR_REPORT_CONFIG_ENDPOINT.replace('{projectId}', projectId.toString())
  ).put2<CreateResponse>({
    entity: rest,
  });
};

const updateConfig = async (
  config: UpdateAcceleratorReportConfigPayload,
  projectId: string
): Promise<Response2<UpdateConfigResponse>> => {
  return HttpService.root(
    ACCELERATOR_REPORT_CONFIG_ENDPOINT.replace('{projectId}', projectId)
  ).post2<UpdateConfigResponse>({
    entity: { config },
  });
};

const listProjectMetrics = async (projectId: string): Promise<Response2<ListProjectMetricsResponsePayload>> => {
  return HttpService.root(
    PROJECT_METRICS_ENDPOINT.replace('{projectId}', projectId)
  ).get2<ListProjectMetricsResponsePayload>();
};

const listStandardMetrics = async (): Promise<Response2<ListStandardMetricsResponsePayload>> => {
  return HttpService.root(STANDARD_METRICS_ENDPOINT).get2<ListProjectMetricsResponsePayload>();
};

const listSystemdMetrics = async (): Promise<Response2<ListSystemMetricsResponsePayload>> => {
  return HttpService.root(SYSTEM_METRICS_ENDPOINT).get2<ListSystemMetricsResponsePayload>();
};

const createProjectMetric = async (
  request: CreateProjectMetricRequest
): Promise<Response2<CreateProjectMetricResponse>> => {
  const { projectId, ...rest } = request;
  return HttpService.root(PROJECT_METRICS_ENDPOINT.replace('{projectId}', projectId)).put2<CreateProjectMetricResponse>(
    {
      entity: rest,
    }
  );
};

const createStandardMetric = async (
  request: CreateStandardMetricRequestPayload
): Promise<Response2<CreateStandardMetricResponse>> => {
  return HttpService.root(STANDARD_METRICS_ENDPOINT).put2<CreateStandardMetricResponse>({
    entity: request,
  });
};

const listAcceleratorReports = async (
  projectId: string,
  locale?: string,
  search?: SearchNodePayload,
  sortOrder?: SearchSortOrder,
  includeMetrics?: boolean,
  includeFuture?: boolean,
  year?: string
): Promise<Response & AcceleratorReportsData> => {
  let searchOrderConfig: SearchOrderConfig | undefined;
  if (sortOrder) {
    searchOrderConfig = {
      locale: locale ?? null,
      sortOrder,
    };
  }
  let params = { includeMetrics: (!!includeMetrics).toString(), includeFuture: (!!includeFuture).toString() };

  if (year) {
    const yearParam = { year };
    params = { ...params, ...yearParam };
  }

  return await HttpService.root(PROJECT_REPORTS_ENDPOINT.replace('{projectId}', projectId)).get<
    ListAcceleratorReportsResponsePayload,
    AcceleratorReportsData
  >(
    {
      params,
    },
    (data) => ({
      reports: searchAndSort(data?.reports || [], search, searchOrderConfig),
    })
  );
};

export type UpdateAcceleratorReportParams = {
  projectId: number;
  reportId: number;
  report: AcceleratorReport;
};

const updateAcceleratorReport = async (
  params: UpdateAcceleratorReportParams
): Promise<Response2<UpdateAcceleratorReportResponse>> => {
  const { projectId, reportId, report } = params;

  return HttpService.root(
    ACCELERATOR_REPORT_ENDPOINT.replace('{projectId}', projectId.toString()).replace('{reportId}', reportId.toString())
  ).post2<UpdateAcceleratorReportResponse>({
    entity: report,
  });
};

const updateProjectMetric = async (
  request: UpdateProjectMetricRequest
): Promise<Response2<UpdateProjectMetricResponse>> => {
  const { projectId, metricId, ...rest } = request;
  return HttpService.root(
    PROJECT_METRIC_ENDPOINT.replace('{projectId}', projectId.toString()).replace('{metricId}', metricId.toString())
  ).post2<UpdateProjectMetricResponse>({
    entity: rest,
  });
};

const updateStandardMetric = async (
  request: UpdateStandardMetricRequestPayload
): Promise<Response2<UpdateStandardMetricResponse>> => {
  return HttpService.root(
    STANDARD_METRIC_ENDPOINT.replace('{metricId}', request.metric.id.toString())
  ).post2<UpdateStandardMetricResponse>({
    entity: request,
  });
};

const updateMetricTargets = async (
  request: UpdateReportMetricTargets,
  projectId: number,
  updateSubmitted: boolean = false
): Promise<Response2<UpdateReportTargetResponse>> => {
  const queryParams = { updateSubmitted };
  const endpoint = addQueryParams(UPDATE_REPORT_TARGET_ENDPOINT, queryParams);
  return HttpService.root(endpoint.replace('{projectId}', projectId.toString())).post2<UpdateReportTargetResponse>({
    entity: request,
  });
};

const reviewAcceleratorReportMetrics = async (
  request: ReviewAcceleratorReportMetricsRequestPayload,
  projectId: number,
  reportId: number
): Promise<Response2<ReviewAcceleratorReportMetricsResponse>> => {
  return HttpService.root(
    REVIEW_ACCELERATOR_REPORT_METRICS_ENDPOINT.replace('{projectId}', projectId.toString()).replace(
      '{reportId}',
      reportId.toString()
    )
  ).post2<ReviewAcceleratorReportMetricsResponse>({
    entity: request,
  });
};

const reviewAcceleratorReport = async (
  review: ReportReviewPayload,
  projectId: number,
  reportId: number
): Promise<Response2<ReviewAcceleratorReportResponse>> => {
  return HttpService.root(
    REVIEW_ACCELERATOR_REPORT_ENDPOINT.replace('{projectId}', projectId.toString()).replace(
      '{reportId}',
      reportId.toString()
    )
  ).post2<ReviewAcceleratorReportResponse>({
    entity: { review },
  });
};

const refreshAcceleratorReportSystemMetrics = async (
  projectId: number,
  reportId: number,
  metricName: SystemMetricName
): Promise<Response2<RefreshAcceleratorReportSystemMetricsResponse>> => {
  const queryParams: RefreshQuery = { metrics: [metricName] };
  const endpoint = addQueryParams(REFRESH_ACCELERATOR_REPORT_METRICS_ENDPOINT, queryParams);
  return HttpService.root(
    endpoint.replace('{projectId}', projectId.toString()).replace('{reportId}', reportId.toString())
  ).post2<RefreshAcceleratorReportSystemMetricsResponse>({});
};

const submitAcceleratorReport = async (params: {
  projectId: string;
  reportId: string;
}): Promise<Response2<SubmitAcceleratorReportResponse>> => {
  const { projectId, reportId } = params;

  return HttpService.root(
    SUBMIT_ACCELERATOR_REPORT_ENDPOINT.replace('{projectId}', projectId.toString()).replace(
      '{reportId}',
      reportId.toString()
    )
  ).post2<SubmitAcceleratorReportResponse>();
};

const publishAcceleratorReport = async (
  projectId: string,
  reportId: string
): Promise<Response2<PublishAcceleratorReportResponse>> => {
  return HttpService.root(
    PUBLISH_ACCELERATOR_REPORT_ENDPOINT.replace('{projectId}', projectId).replace('{reportId}', reportId)
  ).post2<PublishAcceleratorReportResponse>();
};

/**
 * Exported functions
 */
const ReportService = {
  getAcceleratorReport,
  getAcceleratorReportConfig,
  createConfig,
  updateConfig,
  listProjectMetrics,
  listStandardMetrics,
  listSystemdMetrics,
  createProjectMetric,
  createStandardMetric,
  listAcceleratorReports,
  updateAcceleratorReport,
  updateMetricTargets,
  updateProjectMetric,
  updateStandardMetric,
  reviewAcceleratorReportMetrics,
  reviewAcceleratorReport,
  refreshAcceleratorReportSystemMetrics,
  submitAcceleratorReport,
  publishAcceleratorReport,
};

export default ReportService;
