import { createSlice } from '@reduxjs/toolkit';

import { StatusT, buildReducers } from 'src/redux/features/asyncUtils';
import { OrganizationUser } from 'src/types/User';

import { requestListOrganizationUsers } from './organizationUsersAsyncThunks';

export type OrganizationUsersData = {
  users: OrganizationUser[];
};

const initialStateOrganizationUsers: { [key: string]: StatusT<OrganizationUsersData> } = {};

export const organizationUsersListSlice = createSlice({
  name: 'organizationUsersListSlice',
  initialState: initialStateOrganizationUsers,
  reducers: {},
  extraReducers: (builder) => {
    buildReducers(requestListOrganizationUsers)(builder);
  },
});

const organizationUsersReducers = {
  organizationUsersList: organizationUsersListSlice.reducer,
};

export default organizationUsersReducers;
