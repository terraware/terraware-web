import axios from '..';
import { Site, sitesEndpoint, SitesListResponse } from '../types/site';

export const getSites = async (): Promise<Site[]> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${sitesEndpoint}`;

  const response: SitesListResponse = (await axios.get(endpoint)).data;

  return response.sites.map((obj) => ({ id: obj.id, name: obj.name, projectId: obj.projectId }));
};
