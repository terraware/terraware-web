import axios from 'axios';
import { TokenResponse } from './types/auth';
import { Layer } from './types/layer';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/layers`;

export const getLayers = async (
  token: TokenResponse,
  siteId: number
): Promise<Layer[]> => {
  const endpoint = `${BASE_URL}?site_id=${siteId}`;

  return (
    await axios.get(endpoint, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data.layers;
};
