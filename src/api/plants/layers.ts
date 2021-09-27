import axios from 'axios';
import { Layer } from '../types/layer';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/layers`;

export const getLayers = async (siteId: number): Promise<Layer[]> => {
  const endpoint = `${BASE_URL}?site_id=${siteId}`;

  return (await axios.get(endpoint)).data.layers;
};
