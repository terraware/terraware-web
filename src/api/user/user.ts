import axios from 'axios';
import { paths } from '../types/generated-schema';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}`;

const GET_USER_ENDPOINT = '/api/v1/users/me';

type UserResponse = paths[typeof GET_USER_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type User = {
  firstName?: string;
  lastName?: string;
  email: string;
};

export async function getUser(): Promise<User> {
  const endpoint = `${BASE_URL}${GET_USER_ENDPOINT}`;
  const response: UserResponse = (await axios.get(endpoint)).data;
  return response.user;
}
