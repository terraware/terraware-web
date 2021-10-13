import axios from '..';
import { clockEndpoint, ClockGetResponse } from '../types/clock';

export const getDate = async (): Promise<string> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${clockEndpoint}`;
  const response: ClockGetResponse = (await axios.get(endpoint)).data;

  return response.currentTime;
};
