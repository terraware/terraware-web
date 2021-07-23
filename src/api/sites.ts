import axios from 'axios';
import { TokenResponse } from './types/auth';
import { Site } from './types/site';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/sites`;

export const getSites = async (token: TokenResponse): Promise<Site[]> => {
  const endpoint = `${BASE_URL}`;

  return (
    await axios.get(endpoint, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data.sites;
};
