import axios from 'axios';
import { components } from '../api/types/generated-schema';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/site`;
type ListSitesElement = components['schemas']['ListSitesElement'];

export const getSites = async (): Promise<number[]> => {
  const endpoint = `${BASE_URL}`;
  const sites : ListSitesElement[] = (await axios.get(endpoint)).data.sites;

  return sites.map((site) => {return site.id;});
};
