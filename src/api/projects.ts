import axios from 'axios';
import { Project } from './types/project';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/projects`;

export const getProjects = async (): Promise<Project[]> => {
  const endpoint = `${BASE_URL}`;

  const token = JSON.parse(localStorage.getItem('session') || '{}');

  const tokenType =
    token.token_type.charAt(0).toUpperCase() + token.token_type.slice(1);

  return (
    await axios.get(endpoint, {
      headers: {
        Authorization: `${tokenType} ${token.access_token}`,
      },
    })
  ).data.projects;
};
