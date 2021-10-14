import { paths } from './generated-schema';

export const projectsEndpoint = '/api/v1/projects';
export type ProjectsListResponse = paths[typeof projectsEndpoint]['get']['responses'][200]['content']['application/json'];

export interface Project {
  id?: number | undefined;
  name: string;
}
