import axios from 'axios';
import {
  Feature,
  FeatureDeleteResponse,
  FeatureListResponse,
} from '../types/feature';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/gis/features`;

export const getFeatures = async (
  layerId: number,
  limit?: number,
  skip?: number
): Promise<Feature[]> => {
  const endpoint = `${BASE_URL}/list/${layerId}?limit=${limit ?? 5000}&skip=${
    skip ?? 0
  }`;
  const response: FeatureListResponse = (await axios.get(endpoint)).data;

  return response.features as Feature[];
};

export const deleteFeature = async (
  featureId: number
): Promise<FeatureDeleteResponse> => {
  const endpoint = `${BASE_URL}/${featureId}`;
  const response: FeatureDeleteResponse = (await axios.get(endpoint)).data;

  return response;
};
