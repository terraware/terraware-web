import { OrganizationUser, User } from 'src/types/User';

export const getUserDisplayName = (user?: User | OrganizationUser): string => {
  if (user?.firstName && user?.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user?.firstName) {
    return user.firstName;
  }
  if (user?.lastName) {
    return user.lastName;
  }
  return user?.email || '';
};
