import { paths } from './generated-schema';

export const summaryEndpoint = '/api/v1/seedbank/summary/{facilityId}';
export type SummaryGetResponse = paths[typeof summaryEndpoint]['get']['responses'][200]['content']['application/json'];
export type SummaryStatistic =
  | SummaryGetResponse['activeAccessions']
  | SummaryGetResponse['species']
  | SummaryGetResponse['families'];
