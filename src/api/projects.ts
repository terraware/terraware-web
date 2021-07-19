import axios from 'axios';
import { TokenResponse } from './types/auth';
import { Project } from './types/project';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/projects`;

export const getProjects = async (token: TokenResponse): Promise<Project[]> => {
  const endpoint = `${BASE_URL}`;

  return (
    await axios.get(endpoint, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data.projects;
};
