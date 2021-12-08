import axios from '..';
import { reportEndpoint, SearchExportPostRequestBody, SearchExportPostResponse } from '../types/report';

export const downloadReport = async (params: SearchExportPostRequestBody): Promise<string> => {
  const response: SearchExportPostResponse = (await axios.post(reportEndpoint, params)).data;

  return response;
};
