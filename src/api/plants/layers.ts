import axios from 'axios';
import { LayerListResponse, LayerResponse } from '../types/layer';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/layers`;

export const getLayers = async (siteId: number): Promise<LayerResponse[]> => {
  const endpoint = `${BASE_URL}?site_id=${siteId}`;

  const response: LayerListResponse = (await axios.get(endpoint)).data;

  return response.layers;
};
