import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from './HttpService';

const REPORTS_SETTINGS_ENDPOINT = '/api/v1/reports/settings';

export type ReportsSettingsResponsePayload =
  paths[typeof REPORTS_SETTINGS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type ReportsSettingsResponse = Response & ReportsSettingsResponsePayload;

const httpReportsSettings = HttpService.root(REPORTS_SETTINGS_ENDPOINT);

const getReportsSettings = (organizationId: number): Promise<ReportsSettingsResponse> => {
  return httpReportsSettings.get<ReportsSettingsResponsePayload, ReportsSettingsResponsePayload | undefined>(
    { params: { organizationId: organizationId.toString() } },
    (data) => data
  );
};

const ReportsSettingsService = {
  getReportsSettings,
};

export default ReportsSettingsService;
