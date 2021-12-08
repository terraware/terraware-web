import axios from '..';
import { paths } from 'src/api/types/generated-schema';

const SUMMARY_ENDPOINT = '/api/v1/seedbank/summary/{facilityId}';
export type SeedbankSummary = paths[typeof SUMMARY_ENDPOINT]['get']['responses'][200]['content']['application/json'];
export type SummaryStatistic =
  | SeedbankSummary['activeAccessions']
  | SeedbankSummary['species']
  | SeedbankSummary['families'];

/*
 * getSummary() always returns a promise that resolves. The caller must examine the response to check if
 * any errors occurred.
 */
export type GetSummaryResponse = {
  value?: SeedbankSummary;
  errorOccurred: boolean;
};

export const getSummary = async (facilityId: number): Promise<GetSummaryResponse> => {
  const response: GetSummaryResponse = {
    value: undefined,
    errorOccurred: false,
  };

  try {
    const endpoint = SUMMARY_ENDPOINT.replace('{facilityId}', `${facilityId}`);
    response.value = (await axios.get(endpoint)).data;
  } catch {
    response.errorOccurred = true;
  }

  return response;
};
