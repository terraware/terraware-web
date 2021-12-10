import axios from 'axios';
import { User } from 'src/types/User';
import { paths } from '../types/generated-schema';

const GET_USER_ENDPOINT = '/api/v1/users/me';

type UserResponse = paths[typeof GET_USER_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type GetUserResponse = {
  user: User | null;
  requestSucceeded: boolean;
};

export async function getUser(): Promise<GetUserResponse> {
  const response: GetUserResponse = {
    user: null,
    requestSucceeded: true,
  };

  try {
    const serverResponse: UserResponse = (await axios.get(GET_USER_ENDPOINT)).data;
    response.user = {
      email: serverResponse.user.email,
      firstName: serverResponse.user.firstName,
      lastName: serverResponse.user.lastName,
    };
  } catch {
    response.requestSucceeded = false;
  }

  return response;
}
