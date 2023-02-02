import axios from '..';
import { paths } from 'src/api/types/generated-schema';
import addQueryParams from '../helpers/addQueryParams';

const SUMMARY_ENDPOINT = '/api/v1/seedbank/summary';
export type SeedbankSummary = paths[typeof SUMMARY_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type SeedBankSummaryQuery = paths[typeof SUMMARY_ENDPOINT]['get']['parameters']['query'];

/*
 * getSummary() always returns a promise that resolves. The caller must examine the response to check if
 * any errors occurred.
 */
export type GetSummaryResponse = {
  value?: SeedbankSummary;
  errorOccurred: boolean;
};

export const getSummary1 = async (organizationId: number): Promise<GetSummaryResponse> => {
  const response: GetSummaryResponse = {
    value: undefined,
    errorOccurred: false,
  };

  try {
    const queryParams: SeedBankSummaryQuery = { organizationId: organizationId.toString() };
    const endpoint = addQueryParams(SUMMARY_ENDPOINT, queryParams);
    response.value = (await axios.get(endpoint)).data;
  } catch {
    response.errorOccurred = true;
  }

  return response;
};
