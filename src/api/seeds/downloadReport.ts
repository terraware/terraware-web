import axios from 'axios';
import { ExportRequestPayload } from '../types/report';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/seedbank`;

export const downloadReport = async (
  params: ExportRequestPayload
): Promise<string> => {
  const endpoint = `${BASE_URL}/search/export`;

  return (await axios.post(endpoint, params)).data;
};
