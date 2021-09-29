import axios from 'axios';
import { ListProjectsResponsePayload, ProjectPayload } from '../types/project';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/projects`;

export const getProjects = async (): Promise<ProjectPayload[]> => {
  const endpoint = `${BASE_URL}`;

  const response: ListProjectsResponsePayload = (await axios.get(endpoint)).data;

  return response.projects;
};
