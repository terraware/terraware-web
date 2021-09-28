import axios from 'axios';
import { ListSitesResponsePayload, SiteElement } from '../types/site';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/sites`;

export const getSites = async (): Promise<SiteElement[]> => {
  const endpoint = `${BASE_URL}`;

  const response: ListSitesResponsePayload = (await axios.get(endpoint)).data;

  return response.sites;
};
