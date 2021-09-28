import axios from 'axios';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/seedbank`;

export const getDate = async (): Promise<string> => {
  const endpoint = `${BASE_URL}/clock`;

  return (await axios.get(endpoint)).data.currentTime;
};
