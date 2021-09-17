import axios from 'axios';
import { Log } from '../components/Snackbar';

const BASE_URL = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank`;

export const sendLog = async (params: Log): Promise<string> => {
  const endpoint = `${BASE_URL}/log/seedbank`;
  return await axios.post(endpoint, params);
};
