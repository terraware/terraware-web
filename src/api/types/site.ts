import { paths } from './generated-schema';

export const sitesEndpoint = '/api/v1/sites';
export type SitesListResponse = paths[typeof sitesEndpoint]['get']['responses'][200]['content']['application/json'];

export interface Site {
  id?: number | undefined;
  projectId: number;
  name: string;
}
