import axios from 'axios';
import { TokenResponse, User } from './types/auth';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/token`;

export const login = async (user: User): Promise<TokenResponse> => {
  const bodyFormData = new FormData();
  bodyFormData.append('username', user.username);
  bodyFormData.append('password', user.password);
  bodyFormData.append('grant_type', user.grant_type);
  const endpoint = `${BASE_URL}`;

  return (await axios.post(endpoint, bodyFormData)).data;
};
