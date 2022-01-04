export type User = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

export type OrganizationUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  id: number;
  role: 'Contributor' | 'Manager' | 'Admin' | 'Owner';
  projectIds: number[];
};
