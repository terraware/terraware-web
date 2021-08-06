import axios from 'axios';
import { TokenResponse } from './types/auth';
import { Plant } from './types/plant';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/plants`;

export const getPlant = async (
  token: TokenResponse,
  featureId: number
): Promise<Plant> => {
  const endpoint = `${BASE_URL}/${featureId}`;

  return (
    await axios.get(endpoint, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data;
};

export const deletePlant = async (
  token: TokenResponse,
  featureId: number
): Promise<Plant> => {
  const endpoint = `${BASE_URL}/${featureId}`;

  return (
    await axios.delete(endpoint, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data;
};

export const putPlant = async (
  token: TokenResponse,
  featureId: number,
  plant: Plant
): Promise<Plant> => {
  const endpoint = `${BASE_URL}/${featureId}`;

  return (
    await axios.put(endpoint, plant, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data;
};
