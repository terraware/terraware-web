import axios from 'axios';
import { Project } from './types/project';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/projects`;

export const getProjects = async (): Promise<Project[]> => {
  const endpoint = `${BASE_URL}`;

  return (await axios.get(endpoint)).data.projects;
};
