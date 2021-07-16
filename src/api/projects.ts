import axios from 'axios';
import { TokenResponse } from './types/auth';
import { Project } from './types/project';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/projects`;

export const getProjects = async (token: TokenResponse): Promise<Project[]> => {
  const endpoint = `${BASE_URL}`;

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
