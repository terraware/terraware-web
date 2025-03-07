import { paths } from 'src/api/types/generated-schema';
import { ExistingAcceleratorReportConfig } from 'src/types/AcceleratorReport';

import HttpService, { Response } from './HttpService';

export type ReportsConfigData = {
  config?: ExistingAcceleratorReportConfig;
};

export type ReportsConfigResponse = Response & ReportsConfigData;

const ACCELERATOR_REPORT_CONFIG_ENDPOINT = '/api/v1/accelerator/projects/{projectId}/reports/configs';

type ListAcceleratorReportConfigResponsePayload =
  paths[typeof ACCELERATOR_REPORT_CONFIG_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const httpAcceleratorReportsConfig = HttpService.root(ACCELERATOR_REPORT_CONFIG_ENDPOINT);

/**
 * Get project reports config
 */
const getAcceleratorReportConfig = async (projectId: number): Promise<ReportsConfigResponse> => {
  const response: ReportsConfigResponse = await httpAcceleratorReportsConfig.get<
    ListAcceleratorReportConfigResponsePayload,
    ReportsConfigData
  >(
    {
      urlReplacements: {
        '{projectId}': projectId.toString(),
      },
    },
    (data) => ({ config: data?.configs[0] })
  );

  return response;
};
/**
 * Exported functions
 */
const ReportService = {
  getAcceleratorReportConfig,
};

export default ReportService;
