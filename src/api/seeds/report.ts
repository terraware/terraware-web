import axios from '..';
import { reportEndpoint, SearchExportPostRequestBody, SearchExportPostResponse } from '../types/report';

export const downloadReport = async (params: SearchExportPostRequestBody): Promise<string> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${reportEndpoint}`;
  const response: SearchExportPostResponse = (await axios.post(endpoint, params)).data;

  return response;
};
