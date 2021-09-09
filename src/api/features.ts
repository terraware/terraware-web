import axios from 'axios';
import { Feature } from './types/feature';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/features`;

export const getFeatures = async (layerId: number): Promise<Feature[]> => {
  const endpoint = `${BASE_URL}?layer_id=${layerId}&crs=4326&limit=5000`;

  return (await axios.get(endpoint)).data.features;
};

export const deleteFeature = async (featureId: number): Promise<Feature> => {
  const endpoint = `${BASE_URL}/${featureId}`;

  return (await axios.delete(endpoint)).data;
};
