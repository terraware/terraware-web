import axios from 'axios';
import { User } from 'src/types/User';
import { paths } from '../types/generated-schema';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}`;

const GET_USER_ENDPOINT = '/api/v1/users/me';

type UserResponse = paths[typeof GET_USER_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type GetUserResponse = {
  user: User;
  requestSucceeded: boolean;
};

export async function getUser(): Promise<GetUserResponse> {
  const response: GetUserResponse = {
    user: {},
    requestSucceeded: true,
  };

  try {
    const endpoint = `${BASE_URL}${GET_USER_ENDPOINT}`;
    const serverResponse: UserResponse = (await axios.get(endpoint)).data;
    response.user = serverResponse.user;
  } catch {
    response.requestSucceeded = false;
  }

  return response;
}
