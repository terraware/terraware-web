import { getMapboxToken } from 'src/api/tracking/tracking';

let token: string | undefined;
let lastSite: number | undefined;

const getToken = async (site: number) => {
  if (!token || site !== lastSite) {
    const response = await getMapboxToken();
    if (response.requestSucceeded) {
      token = response.token;
      lastSite = site;
    } else {
      throw new Error(response.error);
    }
  }
  return token;
};

const refreshToken = async (site: number) => {
  token = undefined;
  return await getToken(site);
};

const TokenProvider = {
  getToken,
  refreshToken,
};

export default TokenProvider;
