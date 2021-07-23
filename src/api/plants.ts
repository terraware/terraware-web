import axios from 'axios';
import { TokenResponse } from './types/auth';
import { Plant } from './types/plant';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/sites`;

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
