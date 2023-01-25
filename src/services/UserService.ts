import HttpService, { Response } from './HttpService';
import { User } from 'src/types/User';

/**
 * Service for user related functionality
 */

export type UserResponse = Response & {
  user?: User;
};

const httpCurrentUser = HttpService.root('/api/v1/users/me');

const getUser = async (): Promise<UserResponse> => {
  const response: UserResponse = await httpCurrentUser.get();

  if (response.requestSucceeded) {
    const { data } = response;
    if (data?.user) {
      response.user = {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        emailNotificationsEnabled: data.user.emailNotificationsEnabled,
        timeZone: data.user.timeZone,
        locale: data.user.locale,
      };
    }
  }

  return response;
};

const UserService = {
  getUser,
};

export default UserService;
