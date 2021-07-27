import axios from 'axios';
import { TokenResponse } from './types/auth';
import { LayerType } from './types/layer';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/layer_types`;

export const getLayersTypes = async (
  token: TokenResponse
): Promise<LayerType[]> => {
  const endpoint = `${BASE_URL}`;

  return (
    await axios.get(endpoint, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data.layer_types;
};
