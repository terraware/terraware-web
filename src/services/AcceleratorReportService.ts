import { paths } from 'src/api/types/generated-schema';
import {
  CreateAcceleratorReportConfigRequest,
  CreateProjectMetricRequest,
  ExistingAcceleratorReportConfig,
  UpdateAcceleratorReportConfigRequest,
  UpdateProjectMetricRequest,
} from 'src/types/AcceleratorReport';

import HttpService, { Response, Response2 } from './HttpService';

export type ReportsConfigData = {
  config?: ExistingAcceleratorReportConfig;
};

export type ReportsConfigResponse = Response & ReportsConfigData;

const ACCELERATOR_REPORT_CONFIG_ENDPOINT = '/api/v1/accelerator/projects/{projectId}/reports/configs';

const ACCELERATOR_REPORT_SINGLE_CONFIG_ENDPOINT = '/api/v1/accelerator/projects/{projectId}/reports/configs/{configId}';

type ListAcceleratorReportConfigResponsePayload =
  paths[typeof ACCELERATOR_REPORT_CONFIG_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const httpAcceleratorReportsConfig = HttpService.root(ACCELERATOR_REPORT_CONFIG_ENDPOINT);

type CreateResponse =
  paths[typeof ACCELERATOR_REPORT_CONFIG_ENDPOINT]['put']['responses'][200]['content']['application/json'];

type UpdateConfigResponse =
  paths[typeof ACCELERATOR_REPORT_SINGLE_CONFIG_ENDPOINT]['post']['responses'][200]['content']['application/json'];

const PROJECT_METRICS_ENDPOINT = '/api/v1/accelerator/projects/{projectId}/reports/metrics';
const STANDARD_METRICS_ENDPOINT = '/api/v1/accelerator/reports/standardMetrics';
const PROJECT_METRIC_ENDPOINT = '/api/v1/accelerator/projects/{projectId}/reports/metrics/{metricId}';

export type ListProjectMetricsResponsePayload =
  paths[typeof PROJECT_METRICS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type ListStandardMetricsResponsePayload =
  paths[typeof STANDARD_METRICS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type CreateProjectMetricResponse =
  paths[typeof PROJECT_METRICS_ENDPOINT]['put']['responses'][200]['content']['application/json'];

type UpdateProjectMetricResponse =
  paths[typeof PROJECT_METRIC_ENDPOINT]['post']['responses'][200]['content']['application/json'];

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

const updateConfig = async (
  request: UpdateAcceleratorReportConfigRequest
): Promise<Response2<UpdateConfigResponse>> => {
  const { projectId, configId, ...rest } = request;
  return HttpService.root(
    ACCELERATOR_REPORT_SINGLE_CONFIG_ENDPOINT.replace('{projectId}', projectId.toString()).replace(
      '{configId}',
      configId.toString()
    )
  ).post2<UpdateConfigResponse>({
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

/**
 * Exported functions
 */
const ReportService = {
  getAcceleratorReportConfig,
  createConfig,
  updateConfig,
  listProjectMetrics,
  listStandardMetrics,
  createProjectMetric,
  updateProjectMetric,
};

export default ReportService;
