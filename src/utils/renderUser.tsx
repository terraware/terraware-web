import { OrganizationUser, User } from 'src/types/User';

export const renderUser = (userOption: User | OrganizationUser): string => {
  const firstName = userOption?.firstName;
  const lastName = userOption?.lastName;
  const email = userOption?.email;

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  return firstName || lastName || email;
};
