import { paths } from 'src/api/types/generated-schema';
import {
  AcceleratorReport,
  CreateAcceleratorReportConfigRequest,
  CreateProjectMetricRequest,
  ExistingAcceleratorReportConfig,
  UpdateAcceleratorReportConfigRequest,
  UpdateProjectMetricRequest,
} from 'src/types/AcceleratorReport';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { SearchAndSortFn, SearchOrderConfig, searchAndSort as genericSearchAndSort } from 'src/utils/searchAndSort';

import HttpService, { Params, Response, Response2 } from './HttpService';

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

const ACCELERATOR_REPORTS_ENDPOINT = '/api/v1/accelerator/projects/{projectId}/reports';

type ListAcceleratorReportsResponsePayload =
  paths[typeof ACCELERATOR_REPORTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type ListAcceleratorReportsRequestParams =
  paths[typeof ACCELERATOR_REPORTS_ENDPOINT]['get']['parameters']['query'];

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

// TODO: remove mockAcceleratorReports once reports are ready
const mockAcceleratorReports: AcceleratorReport[] = [
  {
    endDate: '2023-12-31',
    id: 1,
    modifiedBy: 78,
    modifiedTime: '2023-10-01',
    projectId: -1,
    projectMetrics: [],
    standardMetrics: [],
    startDate: '2023-01-01',
    status: 'Not Submitted',
    submittedBy: 78,
    submittedTime: '2023-10-01',
    systemMetrics: [],
  },
  {
    endDate: '2023-12-31',
    id: 2,
    modifiedBy: 78,
    modifiedTime: '2023-10-02',
    projectId: -1,
    projectMetrics: [],
    standardMetrics: [],
    startDate: '2023-01-01',
    status: 'Submitted',
    submittedBy: 78,
    submittedTime: '2023-10-02',
    systemMetrics: [],
  },
];

const listAcceleratorReports = async (
  projectId: number,
  locale: string | null,
  params?: ListAcceleratorReportsRequestParams,
  search?: SearchNodePayload,
  searchSortOrder?: SearchSortOrder,
  searchAndSort?: SearchAndSortFn<AcceleratorReport>
): Promise<Response2<ListAcceleratorReportsResponsePayload>> => {
  let searchOrderConfig: SearchOrderConfig | undefined;
  if (searchSortOrder) {
    searchOrderConfig = {
      locale,
      sortOrder: searchSortOrder,
      numberFields: ['id', 'numDocuments', 'organizationId', 'participantId'],
    };
  }

  const result = await HttpService.root(
    ACCELERATOR_REPORTS_ENDPOINT.replace('{projectId}', projectId.toString())
  ).get2<ListAcceleratorReportsResponsePayload>({ params: params as Params });

  if (result.requestSucceeded && result.data?.reports) {
    const reportsResult = searchAndSort
      ? searchAndSort(mockAcceleratorReports, search, searchOrderConfig)
      : genericSearchAndSort(mockAcceleratorReports, search, searchOrderConfig);

    return {
      ...result,
      data: {
        ...result.data,
        reports: reportsResult,
      },
    };
  } else {
    return Promise.reject(result.error);
  }
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
  listAcceleratorReports,
  listProjectMetrics,
  listStandardMetrics,
  createProjectMetric,
  updateProjectMetric,
};

export default ReportService;
