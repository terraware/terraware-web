import axios from 'axios';
import { LayerType } from './types/layer';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/layer_types`;

export const getLayersTypes = async (): Promise<LayerType[]> => {
  const endpoint = `${BASE_URL}`;

  return (await axios.get(endpoint)).data.layer_types;
};
