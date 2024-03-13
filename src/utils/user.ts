type UserIdentity = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

export const getUserDisplayName = (user?: UserIdentity): string => {
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
