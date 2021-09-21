import axios from 'axios';
import { Site } from '../types/site';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/sites`;

export const getSites = async (): Promise<Site[]> => {
  const endpoint = `${BASE_URL}`;

  return (await axios.get(endpoint)).data.sites;
};
