import axios from 'axios';
import { TokenResponse } from './types/auth';
import { Feature } from './types/feature';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/features`;

export const getFeatures = async (
  token: TokenResponse,
  layerId: number
): Promise<Feature[]> => {
  const endpoint = `${BASE_URL}?layer_id=${layerId}&crs=4326`;

  return (
    await axios.get(endpoint, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data.features;
};

export const deleteFeature = async (
  token: TokenResponse,
  featureId: number
): Promise<Feature> => {
  const endpoint = `${BASE_URL}/${featureId}`;

  return (
    await axios.delete(endpoint, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data;
};
