import { paths } from 'src/api/types/generated-schema';

import HttpService, { Response, Response2 } from './HttpService';

const REPORTS_SETTINGS_ENDPOINT = '/api/v1/reports/settings';

export type GetReportsSettingsResponsePayload =
  paths[typeof REPORTS_SETTINGS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type PutReportsSettingsRequestPayload =
  paths[typeof REPORTS_SETTINGS_ENDPOINT]['put']['requestBody']['content']['application/json'];
export type PutReportsSettingsResponsePayload =
  paths[typeof REPORTS_SETTINGS_ENDPOINT]['put']['responses'][200]['content']['application/json'];

export type GetReportsSettingsResponse = Response & GetReportsSettingsResponsePayload;
export type ReportsSettings = Omit<GetReportsSettingsResponsePayload, 'status'>;

const httpReportsSettings = HttpService.root(REPORTS_SETTINGS_ENDPOINT);

const getReportsSettings = (organizationId: number): Promise<GetReportsSettingsResponse> =>
  httpReportsSettings.get<GetReportsSettingsResponsePayload, GetReportsSettingsResponsePayload | undefined>(
    { params: { organizationId: organizationId.toString() } },
    (data) => data
  );

const updateSettings = (
  payload: PutReportsSettingsRequestPayload
): Promise<Response2<PutReportsSettingsResponsePayload>> =>
  httpReportsSettings.put2<PutReportsSettingsResponsePayload>({ entity: payload });

const ReportsSettingsService = {
  getReportsSettings,
  updateSettings,
};

export default ReportsSettingsService;
