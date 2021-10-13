import axios from '..';
import { Project, projectsEndpoint, ProjectsListResponse } from '../types/project';

export const getProjects = async (): Promise<Project[]> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${projectsEndpoint}`;

  const response: ProjectsListResponse = (await axios.get(endpoint)).data;

  return response.projects.map((obj) => ({ id: obj.id, name: obj.name }));
};
