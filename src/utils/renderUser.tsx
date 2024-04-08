import { OrganizationUser, User } from 'src/types/User';

export const renderUser = (userSel: User | OrganizationUser, accUser: User, contributor: boolean): string => {
  const firstName = contributor ? accUser.firstName : userSel?.firstName;
  const lastName = contributor ? accUser.lastName : userSel?.lastName;
  const email = contributor ? accUser.email : userSel?.email;

  if (!firstName && !lastName) {
    return email as string;
  } else if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else {
    return (firstName || lastName) as string;
  }
};
