import axios from '..';
import { summaryEndpoint, SummaryGetResponse } from '../types/summary';

export const getSummary = async (facilityId: number): Promise<SummaryGetResponse> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${summaryEndpoint}`.replace('{facilityId}', `${facilityId}`);
  const response: SummaryGetResponse = (await axios.get(endpoint)).data;

  return response;
};
