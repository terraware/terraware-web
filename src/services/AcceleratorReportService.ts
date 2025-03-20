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
const PROJECT_METRIC_ENDPOINT = '/api/v1/accelerator/projects/{projectId}/reports/metrics/{metricId}';

export type ListProjectMetricsResponsePayload =
  paths[typeof PROJECT_METRICS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type ListStandardMetricsResponsePayload =
  paths[typeof STANDARD_METRICS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type CreateProjectMetricResponse =
  paths[typeof PROJECT_METRICS_ENDPOINT]['put']['responses'][200]['content']['application/json'];

type ListAcceleratorReportsResponsePayload =
  paths[typeof PROJECT_REPORTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type UpdateProjectMetricResponse =
  paths[typeof PROJECT_METRIC_ENDPOINT]['post']['responses'][200]['content']['application/json'];

export type ListAcceleratorReportsRequestParams = paths[typeof PROJECT_REPORTS_ENDPOINT]['get']['parameters']['query'];

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
    frequency: 'Annual',
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
    frequency: 'Annual',
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
  sortOrder?: SearchSortOrder,
  includeMetrics?: boolean,
  includeFuture?: boolean
): Promise<Response & AcceleratorReportsData> => {
  let searchOrderConfig: SearchOrderConfig | undefined;
  if (sortOrder) {
    searchOrderConfig = {
      locale: locale ?? null,
      sortOrder,
    };
  }
  let params = { includeMetrics: (!!includeMetrics).toString(), includeFuture: (!!includeFuture).toString() };

  const yearFilter = search?.children?.find((ch: { field: string }) => ch.field === 'year');
  if (yearFilter) {
    const yearToUse = yearFilter.values[0];
    if (yearToUse) {
      const yearParam = { year: yearToUse };
      params = { ...params, ...yearParam };
    }
  }

  return await HttpService.root(PROJECT_REPORTS_ENDPOINT.replace('{projectId}', projectId)).get<
    ListAcceleratorReportsResponsePayload,
    AcceleratorReportsData
  >(
    {
      params,
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (data) => ({
      // TODO: replace mockAcceleratorReports with data?.reports once backend is ready
      reports: searchAndSort(mockAcceleratorReports || [], search, searchOrderConfig),
    })
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
  listAcceleratorReports,
  updateProjectMetric,
};

export default ReportService;
