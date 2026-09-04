import { OrganizationUser, User } from 'src/types/User';

export const renderUser = (userOption: User | OrganizationUser): string => {
  const { firstName, lastName, email } = userOption;

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  return firstName || lastName || email;
};
