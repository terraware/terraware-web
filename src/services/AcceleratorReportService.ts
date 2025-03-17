import { paths } from 'src/api/types/generated-schema';
import {
  AcceleratorReport,
  CreateAcceleratorReportConfigRequest,
  CreateProjectMetricRequest,
  ExistingAcceleratorReportConfig,
} from 'src/types/AcceleratorReport';
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

type ListAcceleratorReportConfigResponsePayload =
  paths[typeof ACCELERATOR_REPORT_CONFIG_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const httpAcceleratorReportsConfig = HttpService.root(ACCELERATOR_REPORT_CONFIG_ENDPOINT);

type CreateResponse =
  paths[typeof ACCELERATOR_REPORT_CONFIG_ENDPOINT]['put']['responses'][200]['content']['application/json'];

const PROJECT_REPORTS_ENDPOINT = '/api/v1/accelerator/projects/{projectId}/reports';
const PROJECT_METRICS_ENDPOINT = '/api/v1/accelerator/projects/{projectId}/reports/metrics';
const STANDARD_METRICS_ENDPOINT = '/api/v1/accelerator/reports/standardMetrics';

export type ListProjectMetricsResponsePayload =
  paths[typeof PROJECT_METRICS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type ListStandardMetricsResponsePayload =
  paths[typeof STANDARD_METRICS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type CreateProjectMetricResponse =
  paths[typeof PROJECT_METRICS_ENDPOINT]['put']['responses'][200]['content']['application/json'];

type ListAcceleratorReportsResponsePayload =
  paths[typeof PROJECT_REPORTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

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

const createConfig = async (request: CreateAcceleratorReportConfigRequest): Promise<Response2<CreateResponse>> => {
  const { projectId, ...rest } = request;
  return HttpService.root(
    ACCELERATOR_REPORT_CONFIG_ENDPOINT.replace('{projectId}', projectId.toString())
  ).put2<CreateResponse>({
    entity: rest,
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

const listAcceleratorReports = async (
  projectId: string,
  locale?: string,
  search?: SearchNodePayload,
  sortOrder?: SearchSortOrder
): Promise<Response & AcceleratorReportsData> => {
  let searchOrderConfig: SearchOrderConfig | undefined;
  if (sortOrder) {
    searchOrderConfig = {
      locale: locale ?? null,
      sortOrder,
    };
  }
  return await HttpService.root(PROJECT_REPORTS_ENDPOINT.replace('{projectId}', projectId)).get<
    ListAcceleratorReportsResponsePayload,
    AcceleratorReportsData
  >(
    {
      params: { includeMetrics: 'true' },
    },
    (data) => ({
      reports: searchAndSort(data?.reports || [], search, searchOrderConfig),
    })
  );
};

/**
 * Exported functions
 */
const ReportService = {
  getAcceleratorReportConfig,
  createConfig,
  listProjectMetrics,
  listStandardMetrics,
  createProjectMetric,
  listAcceleratorReports,
};

export default ReportService;
